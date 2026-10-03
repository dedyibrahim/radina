<?php

namespace App\Http\Controllers;

use App\Http\Resources\WeddingResource;
use App\Models\Order;
use App\Models\Wedding;
use App\Models\WeddingCustomerPortal;
use App\Services\CustomerPortalService;
use App\Services\WeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminCustomerPortalController extends Controller
{
    public function __construct(private WeddingService $weddings, private CustomerPortalService $service) {}

    private function payload(?WeddingCustomerPortal $portal): ?array
    {
        if (! $portal) {
            return null;
        }

        return ['link' => $portal->revoked_at ? null : url('/pelanggan/'.$portal->token), 'expires_at' => $portal->expires_at, 'revoked_at' => $portal->revoked_at, 'status' => $this->service->status($portal), 'submission' => $portal->submission, 'submission_version' => $portal->submission_version, 'applied_version' => $portal->applied_version, 'submitted_at' => $portal->submitted_at, 'revision_notes' => $portal->revision_notes, 'revision_requested_at' => $portal->revision_requested_at, 'approved_at' => $portal->approved_at];
    }

    public function show(Wedding $wedding)
    {
        $this->weddings->ensurePaid($wedding->order);

        return response()->json(['data' => $this->payload($wedding->customerPortal)])->header('Cache-Control', 'private, no-store');
    }

    private function locked(Wedding $wedding, callable $action)
    {
        return DB::transaction(function () use ($wedding, $action) {
            $order = Order::lockForUpdate()->findOrFail($wedding->order_id);
            $this->weddings->ensurePaid($order);
            abort_if($wedding->is_demo, 422, 'Tautan pelanggan hanya tersedia untuk pesanan.');
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $portal = WeddingCustomerPortal::where('wedding_id', $wedding->id)->lockForUpdate()->first();

            return $action($wedding, $portal);
        });
    }

    public function issue(Request $request, Wedding $wedding)
    {
        return $this->locked($wedding, function ($wedding, $portal) use ($request) {
            $token = bin2hex(random_bytes(32));
            $values = ['created_by' => $request->user()->id, 'token_hash' => hash('sha256', $token), 'token' => $token, 'expires_at' => now()->addDays(30), 'revoked_at' => null];
            if ($portal) {
                $portal->update($values);
            } else {
                $portal = WeddingCustomerPortal::create($values + ['wedding_id' => $wedding->id]);
            }

            return response()->json(['data' => $this->payload($portal->fresh())]);
        });
    }

    public function revoke(Wedding $wedding)
    {
        return $this->locked($wedding, function ($wedding, $portal) {
            abort_unless($portal, 404);
            $portal->update(['revoked_at' => now()]);

            return response()->json(['data' => $this->payload($portal->fresh())]);
        });
    }

    public function apply(Request $request, Wedding $wedding)
    {
        $input = $request->validate(['expected_submission_version' => 'required|integer|min:1', 'expected_updated_at' => 'required|date']);

        return $this->locked($wedding, function ($wedding, $portal) use ($request, $input) {
            abort_unless($portal && ! $portal->revoked_at && $portal->status === 'SUBMITTED', 422, 'Belum ada data pelanggan yang siap diterapkan.');
            abort_if($portal->submission_version !== $input['expected_submission_version'], 409, 'Pengajuan pelanggan berubah. Muat ulang terlebih dahulu.');
            $submission = $this->service->validate($portal->submission, $wedding, true);
            $data = $this->service->apply($wedding, $submission, $request);
            $wedding = $this->weddings->save($wedding, $data, $request->user()->id);
            abort_if($wedding->giftMethods()->where('is_active', false)->count() + count($submission['gift_methods']) > 30, 422, 'Maksimal 30 metode hadiah.');
            $wedding->giftMethods()->where('is_active', true)->delete();
            foreach ($submission['gift_methods'] as $index => $gift) {
                $wedding->giftMethods()->create($gift + ['sort_order' => $index]);
            }
            $portal->update(['applied_version' => $portal->submission_version, 'status' => 'IN_REVIEW', 'approved_fingerprint' => null, 'approved_at' => null]);

            return response()->json(['data' => ['portal' => $this->payload($portal->fresh()), 'wedding' => (new WeddingResource($wedding->fresh()->loadContent()))->resolve($request)]]);
        });
    }

    public function review(Wedding $wedding)
    {
        return $this->locked($wedding, function ($wedding, $portal) {
            abort_unless($portal && ! $portal->revoked_at, 422, 'Buat tautan pelanggan terlebih dahulu.');
            abort_if($portal->status === 'SUBMITTED' && $portal->applied_version !== $portal->submission_version, 422, 'Terapkan pengajuan pelanggan terlebih dahulu.');
            $this->weddings->validateForPublication($wedding);
            $portal->update(['status' => 'IN_REVIEW', 'approved_fingerprint' => null, 'approved_at' => null]);

            return response()->json(['data' => $this->payload($portal->fresh())]);
        });
    }
}
