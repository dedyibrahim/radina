<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wedding;
use App\Models\WeddingCustomerPortal;
use App\Services\CustomerPortalService;
use App\Services\MediaUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CustomerPortalController extends Controller
{
    public function __construct(private CustomerPortalService $service) {}

    private function resolve(string $token): WeddingCustomerPortal
    {
        abort_unless(preg_match('/^[a-f0-9]{64}$/', $token), 404, 'Tautan pelanggan tidak tersedia.');
        $portal = WeddingCustomerPortal::where('token_hash', hash('sha256', $token))->first();
        abort_unless($portal, 404, 'Tautan pelanggan tidak tersedia.');
        $this->check($portal, $token);

        return $portal;
    }

    private function check(WeddingCustomerPortal $portal, string $token): void
    {
        abort_if(! hash_equals($portal->token_hash, hash('sha256', $token)) || $portal->revoked_at || $portal->expires_at->isPast(), 404, 'Tautan sudah kedaluwarsa atau dinonaktifkan. Hubungi admin.');
        $order = $portal->wedding->order;
        abort_if($portal->wedding->is_demo || ! $order || $order->status === 'CANCELLED' || $order->payment?->status !== 'PAID', 404, 'Tautan pelanggan tidak tersedia.');
    }

    private function locked(string $token, callable $action)
    {
        $found = $this->resolve($token);

        return DB::transaction(function () use ($found, $token, $action) {
            Order::lockForUpdate()->findOrFail($found->wedding->order_id);
            $wedding = Wedding::lockForUpdate()->findOrFail($found->wedding_id);
            $portal = WeddingCustomerPortal::lockForUpdate()->findOrFail($found->id);
            $portal->setRelation('wedding', $wedding);
            $this->check($portal, $token);

            return $action($portal);
        });
    }

    private function payload(WeddingCustomerPortal $portal): array
    {
        $status = $this->service->status($portal);
        $form = $portal->submission && $portal->applied_version !== $portal->submission_version
            ? $portal->submission
            : $this->service->initial($portal->wedding);

        return ['event_type' => $portal->wedding->event_type ?? 'wedding', 'status' => $status, 'form' => $form, 'submission_version' => $portal->submission_version, 'submitted_at' => $portal->submitted_at, 'applied_version' => $portal->applied_version, 'revision_notes' => $portal->revision_notes, 'approved_at' => $status === 'APPROVED' ? $portal->approved_at : null, 'expires_at' => $portal->expires_at];
    }

    private function response(array $data)
    {
        return $this->privateResponse(response()->json(['data' => $data]));
    }

    private function privateResponse($response)
    {
        $response->headers->set('Cache-Control', 'private, no-store');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow');

        return $response;
    }

    // Reuse the CSV validation, duplicate detection and guest-link generation used by admin.
    // The wedding always comes from the checked portal, never from customer input.
    public function invitees(Request $request, string $token, AdminInviteeController $invitees)
    {
        return $this->privateResponse($invitees->index($request, $this->resolve($token)->wedding));
    }

    public function rsvps(Request $request, string $token, AdminWeddingController $responses)
    {
        return $this->privateResponse($responses->rsvps($request, $this->resolve($token)->wedding));
    }

    public function wishes(Request $request, string $token, AdminWeddingController $responses)
    {
        return $this->privateResponse($responses->wishes($request, $this->resolve($token)->wedding));
    }

    public function inviteeTemplate(Request $request, string $token, AdminInviteeController $invitees)
    {
        return $this->privateResponse($invitees->template($request, $this->resolve($token)->wedding));
    }

    public function inviteeExport(Request $request, string $token, AdminInviteeController $invitees)
    {
        return $this->privateResponse($invitees->export($request, $this->resolve($token)->wedding));
    }

    public function inviteePreview(Request $request, string $token, AdminInviteeController $invitees)
    {
        return $this->privateResponse($invitees->preview($request, $this->resolve($token)->wedding));
    }

    public function inviteeImport(Request $request, string $token, AdminInviteeController $invitees)
    {
        return $this->locked($token, fn ($portal) => $this->privateResponse($invitees->store($request, $portal->wedding)));
    }

    public function inviteeMessage(Request $request, string $token, AdminInviteeController $invitees)
    {
        return $this->locked($token, fn ($portal) => $this->privateResponse($invitees->message($request, $portal->wedding)));
    }

    public function inviteePhone(Request $request, string $token, \App\Models\WeddingInvitee $invitee, AdminInviteeController $invitees)
    {
        return $this->locked($token, fn ($portal) => $this->privateResponse($invitees->phone($request, $portal->wedding, $invitee)));
    }

    public function document(string $token, string $type, \App\Services\OrderDocumentService $documents)
    {
        return $documents->download($this->resolve($token)->wedding->order, $type);
    }

    public function analytics(Request $request, string $token, \App\Services\InvitationAnalytics $analytics)
    {
        $data = $request->validate(['days' => ['sometimes', Rule::in([7, 30, 90])]]);

        return $this->response($analytics->summary($this->resolve($token)->wedding, (int) ($data['days'] ?? 30)));
    }

    public function guests(Request $request, string $token, \App\Services\InvitationAnalytics $analytics)
    {
        $data = $request->validate(['search' => 'sometimes|nullable|string|max:120']);

        return $this->response($analytics->guests($this->resolve($token)->wedding, $data['search'] ?? '')->toArray());
    }

    public function reminders(string $token, \App\Services\OrderReminderService $reminders)
    {
        $order = $this->resolve($token)->wedding->order;
        $reminders->refresh($order->id);

        return $this->response($reminders->active($order->id)->orderBy('due_at')->limit(20)->get()->map(fn ($r) => collect($r)->only(['id', 'kind', 'title', 'message', 'due_at', 'snoozed_until'])->all())->all());
    }

    public function show(string $token)
    {
        return $this->response($this->payload($this->resolve($token)));
    }

    public function save(Request $request, string $token)
    {
        $input = $request->validate(['data' => 'required|array', 'expected_submission_version' => 'required|integer|min:0', 'submit' => 'required|boolean']);

        return $this->locked($token, function ($portal) use ($input) {
            abort_if($input['expected_submission_version'] !== $portal->submission_version, 409, 'Data sudah berubah di perangkat lain. Muat ulang sebelum menyimpan.');
            $data = $this->service->validate($input['data'], $portal->wedding, $input['submit']);
            $portal->update(['submission' => $data, 'submission_version' => $portal->submission_version + 1, 'submitted_at' => $input['submit'] ? now() : null, 'status' => $input['submit'] ? 'SUBMITTED' : 'DRAFT', 'approved_fingerprint' => null, 'approved_at' => null]);

            return $this->response($this->payload($portal->fresh()));
        });
    }

    public function preview(string $token)
    {
        return $this->locked($token, function ($portal) {
            return $this->response(['wedding' => CustomerPortalService::preview($portal->wedding), 'fingerprint' => CustomerPortalService::fingerprint($portal->wedding), 'status' => $this->service->status($portal)]);
        });
    }

    public function respond(Request $request, string $token)
    {
        $input = $request->validate(['decision' => ['required', Rule::in(['approve', 'revision'])], 'fingerprint' => 'required|string|size:64|regex:/^[a-f0-9]+$/', 'notes' => 'required_if:decision,revision|nullable|string|min:5|max:3000']);

        return $this->locked($token, function ($portal) use ($input) {
            abort_unless(in_array($portal->status, ['IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED']), 422, 'Admin belum mengirim undangan untuk ditinjau.');
            abort_if(! hash_equals($input['fingerprint'], CustomerPortalService::fingerprint($portal->wedding)), 409, 'Preview sudah berubah. Buka preview terbaru sebelum memberikan tanggapan.');
            $portal->update($input['decision'] === 'approve'
                ? ['status' => 'APPROVED', 'approved_fingerprint' => $input['fingerprint'], 'approved_at' => now()]
                : ['status' => 'CHANGES_REQUESTED', 'revision_notes' => $input['notes'], 'revision_requested_at' => now(), 'approved_fingerprint' => null, 'approved_at' => null]);

            return $this->response($this->payload($portal->fresh()));
        });
    }

    public function media(Request $request, string $token, MediaUploadService $uploads)
    {
        $request->validate(['collection' => ['required', Rule::in(['couple', 'covers', 'gallery', 'story', 'gift'])], 'files' => 'required|array|min:1|max:10', 'files.*' => 'required|file|max:12288']);

        return $this->locked($token, function ($portal) use ($request, $uploads) {
            abort_unless($portal->created_by, 422, 'Hubungi admin untuk memperbarui tautan.');
            $prefix = 'customer/'.$portal->id;
            $existing = $portal->wedding->media()->where('path', 'like', 'weddings/'.$portal->wedding_id.'/'.$prefix.'/%');
            abort_if((clone $existing)->count() + count($request->file('files')) > 150 || (clone $existing)->sum('size') + array_sum(array_map(fn ($file) => $file->getSize(), $request->file('files'))) > 200 * 1024 * 1024, 422, 'Batas unggahan tercapai. Hubungi admin.');
            $files = $uploads->store($request->file('files'), $request->input('collection'), $portal->wedding, $portal->created_by, $prefix);

            return $this->response($files);
        });
    }
}
