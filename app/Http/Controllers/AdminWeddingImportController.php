<?php

namespace App\Http\Controllers;

use App\Http\Resources\WeddingResource;
use App\Models\Wedding;
use App\Services\WeddingContentCsv;
use App\Services\WeddingService;
use App\Support\ImportCsv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminWeddingImportController extends Controller
{
    public function __construct(private WeddingService $service, private WeddingContentCsv $csv) {}

    public function template(Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);

        return ImportCsv::download('template-data-pernikahan.csv', ['bagian', 'kunci', 'nilai', 'petunjuk'], $this->csv->rows());
    }

    public function export(Request $request, Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);

        return ImportCsv::download('data-pernikahan-'.$wedding->slug.'.csv', ['bagian', 'kunci', 'nilai', 'petunjuk'], $this->csv->rows($this->csv->data($wedding, $request)));
    }

    public function preview(Request $request, Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);
        $result = $this->csv->parse($request, $wedding);

        return response()->json(['data' => ['changes' => $result['changes'], 'expected_updated_at' => $wedding->updated_at->toJSON()]]);
    }

    public function store(Request $request, Wedding $wedding)
    {
        $request->validate(['expected_updated_at' => 'required|date']);

        return DB::transaction(function () use ($request, $wedding) {
            // Same lock order as the editor save operation.
            $order = $wedding->order()->lockForUpdate()->firstOrFail();
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($order);
            abort_if($request->input('expected_updated_at') !== $wedding->updated_at->toJSON(), 409, 'Konten berubah setelah pratinjau. Muat ulang dan periksa file kembali.');
            $result = $this->csv->parse($request, $wedding);
            $saved = $this->service->save($wedding, $result['data'], $request->user()->id);
            foreach ($result['gifts'] as $gift) {
                if ($gift['id']) {
                    $saved->giftMethods()->findOrFail($gift['id'])->update($gift['data']);
                } else {
                    abort_if($saved->giftMethods()->count() >= 30, 422, 'Maksimal 30 metode hadiah.');
                    $saved->giftMethods()->create($gift['data']);
                }
            }

            return new WeddingResource($saved->fresh()->loadContent());
        });
    }
}
