<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wedding;
use App\Models\WeddingCheckIn;
use App\Models\WeddingInvitee;
use App\Services\InvitationAccess;
use App\Services\InvitationAnalytics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InvitationToolsController extends Controller
{
    public function visit(Request $request, string $slug, InvitationAccess $access, InvitationAnalytics $analytics)
    {
        $data = $request->validate(['visitor_id' => 'required|uuid', 'guest_token' => 'nullable|uuid', 'action' => ['required', Rule::in(['view', 'open'])]]);
        $wedding = $access->published($slug);
        abort_if($wedding->is_demo, 403);
        $analytics->record($wedding, $data);

        return response()->noContent()->header('Cache-Control', 'no-store');
    }

    public function pass(string $token, InvitationAccess $access)
    {
        abort_unless(preg_match('/^[a-f0-9-]{36}$/', $token), 404);
        $guest = WeddingInvitee::where('token', $token)->firstOrFail();
        $wedding = $access->published(Wedding::findOrFail($guest->wedding_id)->slug);
        abort_if($wedding->is_demo, 404);

        return response()->json(['data' => ['name' => $guest->name, 'title' => $wedding->title, 'date' => $wedding->wedding_date?->toDateString(), 'wedding_slug' => $wedding->slug,
            'pass_url' => url('/tamu/'.$guest->token), 'invitation_url' => url('/w/'.$wedding->slug).'?'.http_build_query(['to' => $guest->name, 'guest' => $guest->token])]])
            ->header('Cache-Control', 'private, no-store')->header('Referrer-Policy', 'no-referrer')->header('X-Robots-Tag', 'noindex, nofollow');
    }

    public function analytics(Request $request, Wedding $wedding, InvitationAnalytics $analytics)
    {
        $data = $request->validate(['days' => ['sometimes', Rule::in([7, 30, 90])]]);

        return response()->json(['data' => $analytics->summary($wedding, (int) ($data['days'] ?? 30))])->header('Cache-Control', 'private, no-store');
    }

    public function guests(Request $request, Wedding $wedding, InvitationAnalytics $analytics)
    {
        $data = $request->validate(['search' => 'sometimes|nullable|string|max:120']);

        return response()->json($analytics->guests($wedding, $data['search'] ?? ''))->header('Cache-Control', 'private, no-store');
    }

    private function guest(Request $request, Wedding $wedding): WeddingInvitee
    {
        $data = $request->validate(['code' => 'required|string|max:500']);
        $code = trim($data['code']);
        if (filter_var($code, FILTER_VALIDATE_URL)) {
            $parts = parse_url($code);
            $origin = parse_url(url('/'));
            abort_unless(($parts['host'] ?? '') === ($origin['host'] ?? '') && ($parts['scheme'] ?? '') === ($origin['scheme'] ?? '') && ($parts['port'] ?? null) === ($origin['port'] ?? null), 422, 'QR bukan berasal dari website ini.');
            abort_unless(preg_match('~^/tamu/([a-f0-9-]{36})$~', $parts['path'] ?? '', $match), 422, 'Format QR tamu tidak valid.');
            $code = $match[1];
        }
        abort_unless(preg_match('/^[a-f0-9-]{36}$/', $code), 422, 'Gunakan QR atau kode tamu yang valid.');

        return WeddingInvitee::where('wedding_id', $wedding->id)->where('token', $code)->firstOrFail();
    }

    public function lookup(Request $request, Wedding $wedding)
    {
        $guest = $this->guest($request, $wedding);

        return response()->json(['data' => ['name' => $guest->name, 'address' => $guest->address, 'check_in' => WeddingCheckIn::where('wedding_invitee_id', $guest->id)->first()]]);
    }

    public function checkIn(Request $request, Wedding $wedding, InvitationAccess $access)
    {
        $data = $request->validate(['people_count' => 'required|integer|min:1|max:100']);
        $guest = $this->guest($request, $wedding);
        [$check, $duplicate] = DB::transaction(function () use ($wedding, $guest, $data, $request, $access) {
            Order::lockForUpdate()->findOrFail($wedding->order_id);
            $fresh = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $access->published($fresh->slug);
            abort_if($fresh->is_demo, 403, 'Demo tidak menerima check-in.');
            WeddingInvitee::where('wedding_id', $fresh->id)->lockForUpdate()->findOrFail($guest->id);
            $existing = WeddingCheckIn::where('wedding_invitee_id', $guest->id)->first();
            if ($existing) {
                return [$existing, true];
            }

            return [WeddingCheckIn::create(['wedding_id' => $fresh->id, 'wedding_invitee_id' => $guest->id, 'people_count' => $data['people_count'], 'checked_in_by' => $request->user()->id, 'checked_in_at' => now()]), false];
        });

        return response()->json(['data' => $check, 'already_checked_in' => $duplicate, 'message' => $duplicate ? 'Tamu sudah check-in. Kehadiran tidak dihitung ulang.' : 'Kehadiran tamu berhasil dicatat.'], $duplicate ? 200 : 201);
    }
}
