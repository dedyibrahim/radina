<?php

namespace App\Services;

use App\Models\Wedding;
use App\Models\WeddingCheckIn;
use App\Models\WeddingInvitee;
use Illuminate\Support\Facades\DB;

class InvitationAnalytics
{
    public function record(Wedding $wedding, array $data): void
    {
        DB::transaction(function () use ($wedding, $data) {
            $identity = ['wedding_id' => $wedding->id, 'visitor_hash' => hash('sha256', $data['visitor_id']), 'visit_date' => now('Asia/Jakarta')->toDateString()];
            $guest = empty($data['guest_token']) ? null : WeddingInvitee::where('wedding_id', $wedding->id)->where('token', $data['guest_token'])->first();
            if ($guest) {
                $guestIdentity = ['wedding_invitee_id' => $guest->id, 'visit_date' => $identity['visit_date']];
                $guestInserted = DB::table('invitation_guest_visits')->insertOrIgnore($guestIdentity + ['wedding_id' => $wedding->id, 'last_seen_at' => now(), 'opened_at' => $data['action'] === 'open' ? now() : null]);
                if (! $guestInserted) {
                    $activity = DB::table('invitation_guest_visits')->where($guestIdentity)->lockForUpdate()->first();
                    $guestUpdate = ['last_seen_at' => now()];
                    if ($data['action'] === 'open' && ! $activity->opened_at) {
                        $guestUpdate['opened_at'] = now();
                    }
                    DB::table('invitation_guest_visits')->where('id', $activity->id)->update($guestUpdate);
                }
            }
            $inserted = DB::table('invitation_visits')->insertOrIgnore($identity + ['wedding_invitee_id' => $guest?->id, 'view_count' => 1, 'first_seen_at' => now(), 'last_seen_at' => now(), 'opened_at' => $data['action'] === 'open' ? now() : null]);
            if (! $inserted) {
                $row = DB::table('invitation_visits')->where($identity)->lockForUpdate()->first();
                $update = ['last_seen_at' => now()];
                if ($data['action'] === 'view') {
                    $update['view_count'] = $row->view_count + 1;
                }
                if ($data['action'] === 'open' && ! $row->opened_at) {
                    $update['opened_at'] = now();
                }
                if ($guest && ! $row->wedding_invitee_id) {
                    $update['wedding_invitee_id'] = $guest->id;
                }
                DB::table('invitation_visits')->where('id', $row->id)->update($update);
            }
        });
    }

    public function summary(Wedding $wedding, int $days = 30): array
    {
        $start = now('Asia/Jakarta')->startOfDay()->subDays($days - 1);
        $visits = DB::table('invitation_visits')->where('wedding_id', $wedding->id)->where('visit_date', '>=', $start->toDateString());
        // Latest response per registered guest; legacy responses are grouped by normalized name.
        $rsvps = $wedding->rsvps()->orderByDesc('id')->get()->unique(fn ($row) => $row->wedding_invitee_id ? 'guest-'.$row->wedding_invitee_id : 'name-'.mb_strtolower(trim($row->name)));
        $checkIns = WeddingCheckIn::where('wedding_id', $wedding->id)->get();
        $daily = (clone $visits)->selectRaw('visit_date, SUM(view_count) AS views, COUNT(*) AS visitors, SUM(opened_at IS NOT NULL) AS opens')->groupBy('visit_date')->get()->keyBy('visit_date');
        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i)->toDateString();
            $entry = $daily->get($date);
            $chart[] = ['date' => $date, 'views' => (int) ($entry?->views ?? 0), 'visitors' => (int) ($entry?->visitors ?? 0), 'opens' => (int) ($entry?->opens ?? 0)];
        }

        return ['days' => $days, 'views' => (int) (clone $visits)->sum('view_count'), 'visitors' => (clone $visits)->distinct()->count('visitor_hash'),
            'opens' => (clone $visits)->whereNotNull('opened_at')->distinct()->count('visitor_hash'),
            'guest_links_opened' => DB::table('invitation_guest_visits')->where('wedding_id', $wedding->id)->where('visit_date', '>=', $start->toDateString())->whereNotNull('opened_at')->distinct()->count('wedding_invitee_id'),
            'registered_guests' => WeddingInvitee::where('wedding_id', $wedding->id)->count(),
            'rsvp' => ['attending' => $rsvps->where('attendance', 'Hadir')->count(), 'declined' => $rsvps->where('attendance', 'Tidak Hadir')->count(), 'undecided' => $rsvps->where('attendance', 'Masih Ragu')->count(), 'people' => (int) $rsvps->where('attendance', 'Hadir')->sum('guests')],
            'check_ins' => $checkIns->count(), 'actual_people' => (int) $checkIns->sum('people_count'), 'daily' => $chart,
            'invitation_expires_at' => $wedding->expires_at, 'event_date' => $wedding->wedding_date?->toDateString()];
    }

    public function guests(Wedding $wedding, string $search = '')
    {
        $query = WeddingInvitee::where('wedding_id', $wedding->id);
        if ($search !== '') {
            $query->where('name', 'like', '%'.$search.'%');
        }
        $page = $query->orderBy('name')->paginate(30);
        $ids = $page->pluck('id');
        $seen = DB::table('invitation_guest_visits')->where('wedding_id', $wedding->id)->whereIn('wedding_invitee_id', $ids)->selectRaw('wedding_invitee_id, MAX(last_seen_at) AS seen_at, MAX(opened_at) AS opened_at')->groupBy('wedding_invitee_id')->get()->keyBy('wedding_invitee_id');
        $rsvps = $wedding->rsvps()->whereIn('wedding_invitee_id', $ids)->orderByDesc('id')->get()->unique('wedding_invitee_id')->keyBy('wedding_invitee_id');
        $checks = WeddingCheckIn::where('wedding_id', $wedding->id)->whereIn('wedding_invitee_id', $ids)->get()->keyBy('wedding_invitee_id');

        return $page->through(fn ($guest) => ['id' => $guest->id, 'name' => $guest->name, 'address' => $guest->address, 'pass_url' => url('/tamu/'.$guest->token),
            'invitation_url' => url('/w/'.$wedding->slug).'?'.http_build_query(['to' => $guest->name, 'guest' => $guest->token]),
            'seen_at' => $seen->get($guest->id)?->seen_at, 'opened_at' => $seen->get($guest->id)?->opened_at,
            'attendance' => $rsvps->get($guest->id)?->attendance, 'rsvp_people' => $rsvps->get($guest->id)?->guests,
            'checked_in_at' => $checks->get($guest->id)?->checked_in_at, 'people_count' => $checks->get($guest->id)?->people_count]);
    }
}
