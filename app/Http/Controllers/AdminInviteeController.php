<?php

namespace App\Http\Controllers;

use App\Models\Wedding;
use App\Models\WeddingInvitee;
use App\Services\WeddingService;
use App\Support\ImportCsv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminInviteeController extends Controller
{
    public function __construct(private WeddingService $service) {}

    public function index(Request $request, Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);
        $request->validate(['search' => 'nullable|string|max:120']);
        $query = WeddingInvitee::where('wedding_id', $wedding->id)->orderBy('id');
        if ($search = $request->query('search')) {
            $query->where('name', 'like', '%'.addcslashes($search, '%_\\').'%');
        }
        $result = $query->paginate(30);
        $result->getCollection()->transform(fn ($guest) => $this->present($guest, $wedding));

        return response()->json($result);
    }

    public function template(Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);

        return ImportCsv::download('template-tamu.csv', ['nama', 'alamat'], [['', '']]);
    }

    public function preview(Request $request, Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);
        $data = $this->read($request, $wedding);

        return response()->json(['data' => $data]);
    }

    public function store(Request $request, Wedding $wedding)
    {
        return DB::transaction(function () use ($request, $wedding) {
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($wedding->order);
            $data = $this->read($request, $wedding);
            abort_if(WeddingInvitee::where('wedding_id', $wedding->id)->count() + $data['new_count'] > 10000, 422, 'Maksimal 10.000 tamu per undangan.');
            $insert = [];
            $now = now();
            foreach ($data['rows'] as $row) {
                if ($row['duplicate']) {
                    continue;
                }
                $insert[] = ['wedding_id' => $wedding->id, 'token' => (string) Str::uuid(), 'name' => $row['name'], 'address' => $row['address'], 'fingerprint' => $row['fingerprint'], 'created_at' => $now, 'updated_at' => $now];
            }
            foreach (array_chunk($insert, 250) as $chunk) {
                WeddingInvitee::insert($chunk);
            }

            return response()->json(['data' => ['imported' => $data['new_count'], 'skipped' => $data['duplicate_count']]], 201);
        });
    }

    public function export(Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);
        $rows = WeddingInvitee::where('wedding_id', $wedding->id)->orderBy('id')->cursor()->map(fn ($guest) => [$guest->name, $guest->address, $this->link($guest, $wedding)]);

        return ImportCsv::download('tautan-tamu-'.$wedding->slug.'.csv', ['nama', 'alamat', 'link_undangan'], $rows);
    }

    public function destroy(Wedding $wedding, WeddingInvitee $invitee)
    {
        DB::transaction(function () use ($wedding, $invitee) {
            $order = \App\Models\Order::lockForUpdate()->findOrFail($wedding->order_id);
            $this->service->ensurePaid($order);
            Wedding::lockForUpdate()->findOrFail($wedding->id);
            $guest = WeddingInvitee::where('wedding_id', $wedding->id)->lockForUpdate()->findOrFail($invitee->id);
            abort_if(\App\Models\WeddingCheckIn::where('wedding_invitee_id', $guest->id)->exists(), 422, 'Tamu yang sudah check-in tidak dapat dihapus agar data kehadiran tetap tersimpan.');
            $guest->delete();
        });

        return response()->noContent();
    }

    private function read(Request $request, Wedding $wedding): array
    {
        $request->validate(['file' => 'required|file|max:2048']);
        abort_unless(strtolower($request->file('file')->getClientOriginalExtension()) === 'csv', 422, 'Gunakan file .csv, bukan .xlsx.');
        $rows = ImportCsv::read($request->file('file'), ['nama', 'alamat']);
        $known = WeddingInvitee::where('wedding_id', $wedding->id)->pluck('fingerprint')->flip()->all();
        $result = [];
        $duplicates = 0;
        foreach ($rows as $row) {
            $name = preg_replace('/\s+/u', ' ', ImportCsv::text($row['nama']));
            $address = preg_replace('/\s+/u', ' ', ImportCsv::text($row['alamat']));
            $validator = Validator::make(['nama' => $name, 'alamat' => $address], ['nama' => 'required|string|max:120|not_regex:/[<>\x00-\x1F\x7F]/u', 'alamat' => 'required|string|max:1000']);
            if ($validator->fails()) {
                ImportCsv::fail('Baris '.$row['_row'].': '.implode(' ', $validator->errors()->all()));
            }
            $fingerprint = hash('sha256', mb_strtolower($name)."\0".mb_strtolower($address));
            $duplicate = array_key_exists($fingerprint, $known);
            $known[$fingerprint] = true;
            $duplicates += (int) $duplicate;
            $result[] = ['name' => $name, 'address' => $address, 'fingerprint' => $fingerprint, 'duplicate' => $duplicate, 'row' => $row['_row']];
        }

        return ['rows' => $result, 'new_count' => count($result) - $duplicates, 'duplicate_count' => $duplicates];
    }

    private function link(WeddingInvitee $guest, Wedding $wedding): string
    {
        return url('/w/'.$wedding->slug).'?'.http_build_query(['to' => $guest->name, 'guest' => $guest->token], '', '&', PHP_QUERY_RFC3986);
    }

    private function present(WeddingInvitee $guest, Wedding $wedding): array
    {
        return ['id' => $guest->id, 'name' => $guest->name, 'address' => $guest->address, 'link' => $this->link($guest, $wedding)];
    }
}
