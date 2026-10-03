<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveGiftRequest;
use App\Models\Wedding;
use App\Models\WeddingGiftMethod;
use App\Services\WeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminGiftController extends Controller
{
    public function __construct(private WeddingService $service) {}

    public function index(Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);

        return response()->json(['data' => $wedding->giftMethods]);
    }

    public function store(SaveGiftRequest $request, Wedding $wedding)
    {
        return DB::transaction(function () use ($request, $wedding) {
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($wedding->order);
            $data = $request->giftData();
            $data['sort_order'] ??= ($wedding->giftMethods()->max('sort_order') ?? -1) + 1;
            abort_if($wedding->giftMethods()->count() >= 30, 422, 'Maksimal 30 metode hadiah.');
            $gift = $wedding->giftMethods()->create($data);
            $wedding->touch();

            return response()->json(['data' => $gift, 'updated_at' => $wedding->updated_at], 201);
        });
    }

    public function update(SaveGiftRequest $request, Wedding $wedding, WeddingGiftMethod $gift)
    {
        return DB::transaction(function () use ($request, $wedding, $gift) {
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($wedding->order);
            abort_unless($gift->wedding_id === $wedding->id, 404);
            $gift->update($request->giftData());
            $wedding->touch();

            return response()->json(['data' => $gift->fresh(), 'updated_at' => $wedding->updated_at]);
        });
    }

    public function destroy(Wedding $wedding, WeddingGiftMethod $gift)
    {
        return DB::transaction(function () use ($wedding, $gift) {
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($wedding->order);
            abort_unless($gift->wedding_id === $wedding->id, 404);
            $gift->delete();
            $wedding->touch();

            return response()->json(['message' => 'Metode hadiah dihapus.', 'updated_at' => $wedding->updated_at]);
        });
    }

    public function reorder(Request $request, Wedding $wedding)
    {
        $data = $request->validate(['ids' => 'required|array|min:1|max:30', 'ids.*' => 'required|integer|distinct']);

        return DB::transaction(function () use ($data, $wedding) {
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($wedding->order);
            $actual = $wedding->giftMethods()->pluck('id')->sort()->values()->all();
            $supplied = collect($data['ids'])->sort()->values()->all();
            abort_unless($actual === $supplied, 422, 'Urutan harus mencakup semua metode hadiah undangan ini.');
            foreach ($data['ids'] as $index => $id) {
                $wedding->giftMethods()->where('id', $id)->update(['sort_order' => $index]);
            }$wedding->touch();

            return response()->json(['data' => $wedding->fresh()->giftMethods, 'updated_at' => $wedding->updated_at]);
        });
    }
}
