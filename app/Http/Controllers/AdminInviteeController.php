<?php

namespace App\Http\Controllers;

use App\Models\Wedding;
use App\Models\WeddingInvitee;
use App\Services\GuestInvitationMessage;
use App\Services\WeddingService;
use App\Support\GuestSpreadsheet;
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

        return response()->json($result->toArray() + ['sharing' => GuestInvitationMessage::settings($wedding)])->header('Cache-Control', 'private, no-store');
    }

    public function template(Request $request, Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);

        return GuestSpreadsheet::download('template-tamu', ['nama', 'alamat', 'no_wa'], [['', '', '']], $request->query('format') === 'xlsx');
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
            \App\Models\Order::lockForUpdate()->findOrFail($wedding->order_id);
            $wedding = Wedding::lockForUpdate()->findOrFail($wedding->id);
            $this->service->ensurePaid($wedding->order);
            $data = $this->read($request, $wedding);
            abort_if(WeddingInvitee::where('wedding_id', $wedding->id)->count() + $data['new_count'] > 10000, 422, 'Maksimal 10.000 tamu per undangan.');
            $insert = [];
            $codes = [];
            $now = now();
            foreach ($data['rows'] as $row) {
                if ($row['action'] === 'update') {
                    WeddingInvitee::where('wedding_id', $wedding->id)->where('id', $row['guest_id'])->whereNull('whatsapp')->update(['whatsapp' => $row['whatsapp']]);
                }
                if ($row['action'] !== 'new') {
                    continue;
                }
                do {
                    $code = WeddingInvitee::newShortCode();
                } while (isset($codes[$code]));
                $codes[$code] = true;
                $insert[] = ['wedding_id' => $wedding->id, 'token' => (string) Str::uuid(), 'short_code' => $code, 'whatsapp' => $row['whatsapp'], 'name' => $row['name'], 'address' => $row['address'], 'fingerprint' => $row['fingerprint'], 'created_at' => $now, 'updated_at' => $now];
            }
            foreach (array_chunk($insert, 250) as $chunk) {
                WeddingInvitee::insert($chunk);
            }

            return response()->json(['data' => ['imported' => $data['new_count'], 'updated' => $data['update_count'], 'skipped' => $data['duplicate_count'], 'conflicts' => $data['conflict_count']]], 201);
        });
    }

    public function export(Request $request, Wedding $wedding)
    {
        $this->service->ensurePaid($wedding->order);
        $rows = WeddingInvitee::where('wedding_id', $wedding->id)->orderBy('id')->cursor()->map(function ($guest) use ($wedding) {
            $message = GuestInvitationMessage::render($wedding, $guest);

            return [$guest->name, $guest->address, $guest->whatsapp, $guest->invitationUrl($wedding), $message, $guest->whatsapp ? 'https://wa.me/'.$guest->whatsapp.'?text='.rawurlencode($message) : ''];
        });

        return GuestSpreadsheet::download('tautan-tamu-'.$wedding->slug, ['nama', 'alamat', 'no_wa', 'link_undangan', 'pesan_undangan', 'link_whatsapp'], $rows, $request->query('format') === 'xlsx');
    }

    public function message(Request $request, Wedding $wedding)
    {
        $input = $request->validate(['message_template' => 'present|nullable|string|max:3000|not_regex:/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/']);
        $template = $input['message_template'] ?? null;
        if ($template !== null) {
            abort_unless(str_contains($template, '{nama_tamu}') && str_contains($template, '{link_undangan}'), 422, 'Pesan wajib memuat {nama_tamu} dan {link_undangan}.');
            preg_match_all('/\{[^{}]+\}/u', $template, $matches);
            abort_if(array_diff($matches[0], ['{nama_tamu}', '{nama_acara}', '{tanggal_acara}', '{link_undangan}']), 422, 'Gunakan variabel pesan yang tersedia.');
        }

        return DB::transaction(function () use ($wedding, $template) {
            $order = \App\Models\Order::lockForUpdate()->findOrFail($wedding->order_id);
            $this->service->ensurePaid($order);
            Wedding::lockForUpdate()->findOrFail($wedding->id);
            // Sharing copy does not change the invitation content or its approval version.
            DB::table('weddings')->where('id', $wedding->id)->update(['guest_message_template' => $template]);

            return response()->json(['data' => GuestInvitationMessage::settings($wedding->fresh())])->header('Cache-Control', 'private, no-store');
        });
    }

    public function phone(Request $request, Wedding $wedding, WeddingInvitee $invitee)
    {
        $input = $request->validate(['whatsapp' => 'nullable|string|max:40', 'expected_whatsapp' => 'present|nullable|string|max:15']);
        $phone = GuestInvitationMessage::normalizePhone($input['whatsapp'] ?? null);
        abort_if($phone === '', 422, 'Nomor WhatsApp tidak valid. Contoh: 081234567890 atau +6281234567890.');

        return DB::transaction(function () use ($wedding, $invitee, $input, $phone) {
            $order = \App\Models\Order::lockForUpdate()->findOrFail($wedding->order_id);
            $this->service->ensurePaid($order);
            Wedding::lockForUpdate()->findOrFail($wedding->id);
            $guest = WeddingInvitee::where('wedding_id', $wedding->id)->lockForUpdate()->findOrFail($invitee->id);
            abort_if($guest->whatsapp !== $input['expected_whatsapp'], 409, 'Nomor sudah berubah di perangkat lain. Muat ulang daftar tamu.');
            $guest->update(['whatsapp' => $phone]);

            return response()->json(['data' => $this->present($guest, $wedding)])->header('Cache-Control', 'private, no-store');
        });
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
        $rows = GuestSpreadsheet::read($request->file('file'));
        $known = WeddingInvitee::where('wedding_id', $wedding->id)->get(['id', 'fingerprint', 'whatsapp'])->keyBy('fingerprint')->map(fn ($guest) => ['id' => $guest->id, 'whatsapp' => $guest->whatsapp])->all();
        $result = [];
        foreach ($rows as $row) {
            $name = preg_replace('/\s+/u', ' ', ImportCsv::text($row['nama']));
            $address = preg_replace('/\s+/u', ' ', ImportCsv::text($row['alamat'] ?? ''));
            $phone = GuestInvitationMessage::normalizePhone(ImportCsv::text($row['no_wa'] ?? ''));
            $validator = Validator::make(['nama' => $name, 'alamat' => $address], ['nama' => 'required|string|max:120|not_regex:/[<>\x00-\x1F\x7F]/u', 'alamat' => 'nullable|string|max:1000']);
            if ($validator->fails()) {
                ImportCsv::fail('Baris '.$row['_row'].': '.implode(' ', $validator->errors()->all()));
            }
            if ($phone === '') {
                ImportCsv::fail('Baris '.$row['_row'].': nomor WhatsApp tidak valid. Gunakan format 08..., 628..., atau +628....');
            }
            $fingerprint = hash('sha256', mb_strtolower($name)."\0".mb_strtolower($address));
            $existing = $known[$fingerprint] ?? null;
            $action = 'new';
            if ($existing !== null) {
                $action = 'skip';
                if ($phone && $existing['whatsapp'] && $phone !== $existing['whatsapp']) {
                    // A duplicate inside the same upload with competing numbers must be corrected first.
                    if (isset($existing['index'])) {
                        ImportCsv::fail('Baris '.$row['_row'].': tamu yang sama memiliki nomor WA berbeda. Perbaiki file terlebih dahulu.');
                    }
                    $action = 'conflict';
                } elseif ($phone && ! $existing['whatsapp']) {
                    if (isset($existing['index'])) {
                        $result[$existing['index']]['whatsapp'] = $phone;
                    } else {
                        $action = 'update';
                    }
                    $known[$fingerprint]['whatsapp'] = $phone;
                }
            } else {
                $known[$fingerprint] = ['id' => null, 'whatsapp' => $phone, 'index' => count($result)];
            }
            $result[] = ['name' => $name, 'address' => $address, 'whatsapp' => $phone, 'fingerprint' => $fingerprint, 'guest_id' => $existing['id'] ?? null, 'action' => $action, 'duplicate' => $action !== 'new', 'row' => $row['_row']];
        }
        $counts = array_count_values(array_column($result, 'action'));

        return ['rows' => $result, 'new_count' => $counts['new'] ?? 0, 'update_count' => $counts['update'] ?? 0, 'duplicate_count' => $counts['skip'] ?? 0, 'conflict_count' => $counts['conflict'] ?? 0];
    }

    private function present(WeddingInvitee $guest, Wedding $wedding): array
    {
        return ['id' => $guest->id, 'name' => $guest->name, 'address' => $guest->address, 'whatsapp' => $guest->whatsapp, 'link' => $guest->invitationUrl($wedding)];
    }
}
