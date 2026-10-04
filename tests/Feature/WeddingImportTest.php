<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingInvitee;
use App\Services\DeploymentLicenseGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WeddingImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    private function wedding(string $slug = 'import-test'): Wedding
    {
        $order = Order::create(['template_id' => Template::first()->id, 'order_number' => 'WD-'.$slug, 'customer_name' => 'Import Customer', 'whatsapp' => '6281234567890', 'bride_name' => 'Alya Test', 'groom_name' => 'Dedy Test', 'slug' => $slug, 'total' => 149000, 'status' => 'PAID']);
        $order->payment()->create(['amount' => 149000, 'status' => 'PAID']);
        $id = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->assertCreated()->json('data.id');

        return Wedding::findOrFail($id);
    }

    private function csv(array $headers, array $rows, string $delimiter = ';'): UploadedFile
    {
        $out = fopen('php://temp', 'r+');
        fwrite($out, "\xEF\xBB\xBF");
        fputcsv($out, $headers, $delimiter, '"', '');
        foreach ($rows as $row) {
            fputcsv($out, $row, $delimiter, '"', '');
        }
        rewind($out);
        $content = stream_get_contents($out);
        fclose($out);

        return UploadedFile::fake()->createWithContent('import.csv', $content);
    }

    private function path(Wedding $wedding, string $part): string
    {
        return '/api/admin/weddings/'.$wedding->id.'/'.$part;
    }

    public function test_templates_export_empty_values_and_import_endpoints_are_admin_only(): void
    {
        $w = $this->wedding();
        $content = $this->get($this->path($w, 'content/template'))->assertOk()->streamedContent();
        $this->assertStringContainsString('bagian;kunci;nilai;petunjuk', $content);
        $this->assertStringContainsString('bride.full_name;;', $content);
        $this->assertStringNotContainsString('Alya Test', $content);
        $this->get($this->path($w, 'invitees/template'))->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        Sanctum::actingAs(User::factory()->create());
        foreach (['content/template', 'content/export', 'invitees/template', 'invitees/export', 'invitees'] as $part) {
            $this->getJson($this->path($w, $part))->assertForbidden();
        }
        foreach (['content/preview', 'content/import', 'invitees/preview', 'invitees/import'] as $part) {
            $this->postJson($this->path($w, $part), [])->assertForbidden();
        }
    }

    public function test_content_preview_and_atomic_import_preserve_license_accounts_and_unfilled_fields(): void
    {
        $w = $this->wedding();
        $w->update(['cover_image' => '/storage/existing.webp', 'opening_text' => 'Keep this introduction']);
        $guard = app(DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('a', 40));
        $file = $this->csv(['kunci', 'nilai'], [
            ['bride.full_name', 'Shara, "Putri" Ibrahim'], ['bride.nickname', 'Shara'], ['groom.full_name', 'Dedy Ibrahim'],
            ['wedding_date', '2026-12-20'], ['opening_text', ''], ['events.1.type', 'akad'], ['events.1.title', 'Akad Nikah'], ['events.1.date', '2026-12-20'], ['events.1.start_time', '09:00'], ['events.1.end_time', '10:00'], ['events.1.venue', 'Gedung Test'], ['events.1.address', "Jalan Mawar 1\nJakarta"],
            ['stories.1.date_label', '2020'], ['stories.1.title', 'Awal cerita'], ['stories.1.description', "Bertemu; lalu berbagi cerita.\nBaris kedua."],
            ['gift_methods.1.type', 'BANK'], ['gift_methods.1.provider', 'BCA'], ['gift_methods.1.account_number', '0012345678'], ['gift_methods.1.account_name', 'Shara'], ['gift_methods.1.is_active', 'ya'], ['settings.enable_music', 'tidak'],
        ]);
        $preview = $this->postJson($this->path($w, 'content/preview'), ['file' => $file])->assertOk();
        $this->assertSame('Alya Test', $w->fresh()->couples->firstWhere('role', 'bride')->full_name);
        $this->assertDatabaseCount('wedding_events', Wedding::where('is_demo', true)->withCount('events')->get()->sum('events_count'));
        $this->postJson($this->path($w, 'content/import'), ['file' => $file, 'expected_updated_at' => $preview->json('data.expected_updated_at')])->assertOk()
            ->assertJsonPath('data.bride.full_name', 'Shara, "Putri" Ibrahim')
            ->assertJsonPath('data.cover_image', '/storage/existing.webp')->assertJsonPath('data.opening_text', 'Keep this introduction')
            ->assertJsonPath('data.events.0.start_time', '09:00:00')->assertJsonPath('data.gift_methods.0.account_number', '0012345678')->assertJsonPath('data.settings.enable_music', false);
        $this->assertSame('DRAFT', $w->fresh()->status);
        $this->assertSame("Bertemu; lalu berbagi cerita.\nBaris kedua.", $w->fresh()->stories->first()->description);
        $guard->assertPreserved($backup);
        $this->assertDatabaseHas('system_settings', ['key' => 'bank_account', 'value' => '1680001279155']);
        $gift = $w->fresh()->giftMethods->first();
        $this->assertNotSame('0012345678', $gift->getRawOriginal('account_number'));
        $this->postJson($this->path($w, 'content/import'), ['file' => $file, 'expected_updated_at' => $preview->json('data.expected_updated_at')])->assertStatus(409);
    }

    public function test_invalid_content_and_protected_keys_never_save_partial_changes(): void
    {
        $w = $this->wedding();
        foreach ([['status', 'PUBLISHED'], ['title', 'first', 'title', 'second'], ['cover_image', 'javascript:alert(1)']] as $invalid) {
            $rows = count($invalid) === 4 ? [array_slice($invalid, 0, 2), array_slice($invalid, 2)] : [$invalid];
            $this->postJson($this->path($w, 'content/preview'), ['file' => $this->csv(['kunci', 'nilai'], $rows)])->assertUnprocessable();
        }
        $file = $this->csv(['kunci', 'nilai'], [['bride.full_name', 'Changed Bride'], ['events.1.title', 'Event'], ['events.1.date', '2026-12-20'], ['events.1.start_time', '10:00'], ['events.1.end_time', '09:00'], ['events.1.venue', 'Venue']]);
        $this->postJson($this->path($w, 'content/import'), ['file' => $file, 'expected_updated_at' => $w->updated_at->toJSON()])->assertUnprocessable();
        $this->assertSame('Alya Test', $w->fresh()->couples->firstWhere('role', 'bride')->full_name);
        $this->assertCount(0, $w->fresh()->events);
    }

    public function test_guest_import_deduplicates_and_generates_distinct_private_address_links(): void
    {
        $w = $this->wedding();
        $file = $this->csv(['nama', 'alamat'], [['Ibu Siti & Keluarga', 'Jakarta'], ['ibu siti & keluarga', 'jakarta'], ['Ibu Siti & Keluarga', 'Bandung'], ['José, "Sahabat"', 'Jalan Mawar; nomor 1']], ',');
        $this->postJson($this->path($w, 'invitees/preview'), ['file' => $file])->assertOk()->assertJsonPath('data.new_count', 3)->assertJsonPath('data.duplicate_count', 1);
        $this->assertDatabaseCount('wedding_invitees', 0);
        $this->postJson($this->path($w, 'invitees/import'), ['file' => $file])->assertCreated()->assertJsonPath('data.imported', 3)->assertJsonPath('data.skipped', 1);
        $this->postJson($this->path($w, 'invitees/import'), ['file' => $file])->assertCreated()->assertJsonPath('data.imported', 0)->assertJsonPath('data.skipped', 4);
        $result = $this->getJson($this->path($w, 'invitees'))->assertOk()->assertJsonPath('total', 3)->json('data');
        $this->assertNotSame($result[0]['link'], $result[1]['link']);
        $this->assertMatchesRegularExpression('~/i/[a-f0-9]{16}$~', $result[0]['link']);
        $this->assertStringNotContainsString('guest=', $result[0]['link']);
        $this->assertStringNotContainsString('Jakarta', $result[0]['link']);
        $this->getJson($this->path($w, 'invitees').'?search=José')->assertOk()->assertJsonPath('total', 1);
    }

    public function test_guest_validation_is_atomic_and_bounded(): void
    {
        $w = $this->wedding();
        foreach ([[['Valid Guest', 'Jakarta'], ['', 'Jakarta']], [['<script>bad</script>', 'Jakarta']]] as $rows) {
            $this->postJson($this->path($w, 'invitees/import'), ['file' => $this->csv(['nama', 'alamat'], $rows)])->assertUnprocessable();
            $this->assertDatabaseCount('wedding_invitees', 0);
        }
        $this->postJson($this->path($w, 'invitees/import'), ['file' => $this->csv(['nama', 'alamat'], array_fill(0, 1001, ['Guest', 'Jakarta']))])->assertUnprocessable();
        $this->postJson($this->path($w, 'invitees/import'), ['file' => UploadedFile::fake()->createWithContent('evil.php', 'nama;alamat')])->assertUnprocessable();
        $this->assertDatabaseCount('wedding_invitees', 0);
    }

    public function test_utf16_and_export_formula_protection_round_trip_without_duplicates(): void
    {
        $w = $this->wedding();
        $file = UploadedFile::fake()->createWithContent('excel.csv', "\xFF\xFE".mb_convert_encoding("nama\talamat\r\n+Keluarga Dedy\t=Jakarta\r\n", 'UTF-16LE', 'UTF-8'));
        $this->postJson($this->path($w, 'invitees/import'), ['file' => $file])->assertCreated()->assertJsonPath('data.imported', 1);
        $export = $this->get($this->path($w, 'invitees/export'))->assertOk()->streamedContent();
        $this->assertStringContainsString("'+Keluarga Dedy", $export);
        $this->assertStringContainsString("'=Jakarta", $export);
        $this->postJson($this->path($w, 'invitees/import'), ['file' => UploadedFile::fake()->createWithContent('export.csv', $export)])->assertCreated()->assertJsonPath('data.imported', 0)->assertJsonPath('data.skipped', 1);
        $link = WeddingInvitee::first()->invitationUrl($w);
        $w->update(['slug' => 'updated-slug']);
        $this->assertStringContainsString($link, $this->get($this->path($w, 'invitees/export'))->assertOk()->streamedContent());
    }

    public function test_guest_delete_is_scoped_and_cancelled_order_cannot_import_or_export(): void
    {
        $w = $this->wedding();
        $other = $this->wedding('another-wedding');
        $this->postJson($this->path($other, 'invitees/import'), ['file' => $this->csv(['nama', 'alamat'], [['Guest', 'Jakarta']])])->assertCreated();
        $guest = WeddingInvitee::first();
        $this->deleteJson($this->path($w, 'invitees/'.$guest->id))->assertNotFound();
        $this->assertDatabaseCount('wedding_invitees', 1);
        $this->deleteJson($this->path($other, 'invitees/'.$guest->id))->assertNoContent();
        $w->order->update(['status' => 'CANCELLED']);
        $this->getJson($this->path($w, 'invitees/export'))->assertUnprocessable();
        $this->postJson($this->path($w, 'content/preview'), ['file' => $this->csv(['kunci', 'nilai'], [['title', 'Update']])])->assertUnprocessable();
    }

    public function test_phone_import_fills_missing_numbers_and_preserves_existing_links_on_conflicts(): void
    {
        $w = $this->wedding();
        $path = $this->path($w, 'invitees');
        $this->postJson($path.'/import', ['file' => $this->csv(['nama', 'alamat'], [['Bapak Budi', 'Bogor']])])->assertCreated();
        $guest = WeddingInvitee::first();
        $original = $guest->only(['id', 'token', 'short_code', 'fingerprint']);
        $file = fn () => $this->csv(['nama', 'alamat', 'no_wa'], [['Bapak Budi', 'Bogor', '+62 812-3456-7890'], ['Ibu Ayu', '', '081234567891'], ['Ibu Ayu', '', '6281234567891']]);
        $this->postJson($path.'/preview', ['file' => $file()])->assertOk()->assertJsonPath('data.new_count', 1)->assertJsonPath('data.update_count', 1)->assertJsonPath('data.duplicate_count', 1);
        $this->assertNull($guest->fresh()->whatsapp);
        $this->postJson($path.'/import', ['file' => $file()])->assertCreated()->assertJsonPath('data.imported', 1)->assertJsonPath('data.updated', 1);
        $this->assertSame('6281234567890', $guest->fresh()->whatsapp);
        $this->assertSame($original, $guest->fresh()->only(array_keys($original)));
        $conflict = fn () => $this->csv(['nama', 'alamat', 'no_wa'], [['Bapak Budi', 'Bogor', '081234567899']]);
        $this->postJson($path.'/preview', ['file' => $conflict()])->assertOk()->assertJsonPath('data.conflict_count', 1)->assertJsonPath('data.update_count', 0);
        $this->postJson($path.'/import', ['file' => $conflict()])->assertCreated()->assertJsonPath('data.conflicts', 1)->assertJsonPath('data.imported', 0);
        $this->postJson($path.'/import', ['file' => $file()])->assertCreated()->assertJsonPath('data.imported', 0)->assertJsonPath('data.updated', 0)->assertJsonPath('data.skipped', 3);
        $this->assertSame('6281234567890', $guest->fresh()->whatsapp);
        foreach (['not-a-number', '123', '=1234567890', '6.281234E+11'] as $phone) {
            $this->postJson($path.'/import', ['file' => $this->csv(['nama', 'no_wa'], [['Valid New', '081234567890'], ['Bad Guest', $phone]])])->assertUnprocessable();
            $this->assertDatabaseCount('wedding_invitees', 2);
        }
        $this->postJson($path.'/import', ['file' => $this->csv(['nama', 'no_wa'], [['Same', '081234567890'], ['Same', '081234567899']])])->assertUnprocessable();
        $this->assertDatabaseCount('wedding_invitees', 2);
    }

    public function test_guest_phone_edit_and_message_are_scoped_and_do_not_change_approval_content(): void
    {
        $w = $this->wedding();
        $w->couples()->where('role', 'bride')->update(['full_name' => 'Alya Putri Test, S.Kom.', 'nickname' => 'Alya']);
        $w->couples()->where('role', 'groom')->update(['full_name' => 'Dedy Ibrahim Test', 'nickname' => 'Dedy']);
        $other = $this->wedding('other-whatsapp');
        $path = $this->path($w, 'invitees');
        $this->postJson($path.'/import', ['file' => $this->csv(['nama'], [['Bapak Budi']])])->assertCreated();
        $this->getJson($path)->assertOk()->assertJsonPath('sharing.event_title', 'Pernikahan Alya Putri Test, S.Kom. & Dedy Ibrahim Test');
        $guest = WeddingInvitee::first();
        $fingerprint = \App\Services\CustomerPortalService::fingerprint($w->fresh());
        $this->patchJson($this->path($other, 'invitees/'.$guest->id.'/phone'), ['whatsapp' => '081234567890', 'expected_whatsapp' => null])->assertNotFound();
        $this->patchJson($path.'/'.$guest->id.'/phone', ['whatsapp' => '081234567890', 'expected_whatsapp' => null])->assertOk()->assertJsonPath('data.whatsapp', '6281234567890');
        $this->patchJson($path.'/'.$guest->id.'/phone', ['whatsapp' => '081234567891', 'expected_whatsapp' => null])->assertStatus(409);
        $template = "Yth. {nama_tamu},\nDengan hormat kami mengundang Anda menghadiri {nama_acara}.\n{link_undangan}\nTerima kasih.";
        $this->patchJson($path.'/message', ['message_template' => $template])->assertOk()->assertJsonPath('data.message_template', $template);
        $this->patchJson($path.'/message', ['message_template' => 'Pesan tanpa tautan'])->assertUnprocessable();
        $this->patchJson($path.'/message', ['message_template' => '{nama_tamu} {link_undangan} {rahasia}'])->assertUnprocessable();
        $export = $this->get($path.'/export')->assertOk()->streamedContent();
        $this->assertStringContainsString('no_wa;link_undangan;pesan_undangan;link_whatsapp', $export);
        $this->assertStringContainsString('Yth. Bapak Budi', $export);
        $this->assertStringContainsString('Pernikahan Alya Putri Test, S.Kom. & Dedy Ibrahim Test', $export);
        $this->assertStringContainsString('https://wa.me/6281234567890?text=', $export);
        $this->assertStringContainsString($guest->invitationUrl($w), $export);
        $this->assertSame($fingerprint, \App\Services\CustomerPortalService::fingerprint($w->fresh()));
        $this->patchJson($path.'/message', ['message_template' => null])->assertOk()->assertJsonPath('data.message_template', \App\Services\GuestInvitationMessage::defaultTemplate());
    }

    private function xlsx(array $headers, array $rows, bool $formula = false): UploadedFile
    {
        $book = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $book->getActiveSheet();
        foreach ([$headers, ...$rows] as $r => $row) {
            foreach ($row as $c => $value) {
                $sheet->setCellValueExplicit([$c + 1, $r + 1], $value, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            }
        }
        if ($formula) {
            $sheet->setCellValue('B2', '=1+1');
        }
        $path = tempnam(sys_get_temp_dir(), 'guest-xlsx-');
        try {
            (new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($book))->save($path);

            return UploadedFile::fake()->createWithContent('guests.xlsx', file_get_contents($path));
        } finally {
            unlink($path);
            $book->disconnectWorksheets();
        }
    }

    public function test_excel_round_trip_keeps_phone_numbers_as_text_and_rejects_formulas(): void
    {
        $w = $this->wedding();
        $path = $this->path($w, 'invitees');
        $template = $this->get($path.'/template?format=xlsx')->assertOk()->streamedContent();
        $this->assertStringStartsWith('PK', $template);
        $templateFile = UploadedFile::fake()->createWithContent('template.xlsx', $template);
        $templateBook = (new \PhpOffice\PhpSpreadsheet\Reader\Xlsx())->load($templateFile->getRealPath());
        $this->assertSame('@', $templateBook->getActiveSheet()->getStyle('C2')->getNumberFormat()->getFormatCode());
        $templateBook->disconnectWorksheets();
        $this->postJson($path.'/import', ['file' => $this->xlsx(['nama', 'alamat', 'no_wa'], [['+Keluarga Budi', '=Bogor', '081234567890']])])->assertCreated()->assertJsonPath('data.imported', 1);
        $export = $this->get($path.'/export?format=xlsx')->assertOk()->streamedContent();
        $file = UploadedFile::fake()->createWithContent('export.xlsx', $export);
        $book = (new \PhpOffice\PhpSpreadsheet\Reader\Xlsx)->load($file->getRealPath());
        $this->assertSame('6281234567890', $book->getActiveSheet()->getCell('C2')->getValue());
        $this->assertSame('s', $book->getActiveSheet()->getCell('C2')->getDataType());
        $this->assertSame('s', $book->getActiveSheet()->getCell('B2')->getDataType());
        $book->disconnectWorksheets();
        $this->postJson($path.'/import', ['file' => $file])->assertCreated()->assertJsonPath('data.imported', 0)->assertJsonPath('data.skipped', 1);
        $this->postJson($path.'/import', ['file' => $this->xlsx(['nama', 'no_wa'], [['Bad Guest', '081234567890']], true)])->assertUnprocessable();
        $this->postJson($path.'/import', ['file' => $this->xlsx(['nama'], array_fill(0, 1001, ['Guest']))])->assertUnprocessable();
        $this->assertDatabaseCount('wedding_invitees', 1);
    }

    public function test_short_link_keeps_guest_identity_qr_and_rsvp_and_enforces_published_access(): void
    {
        $w = $this->wedding();
        $this->postJson($this->path($w, 'invitees/import'), ['file' => $this->csv(['nama', 'alamat', 'no_wa'], [['Dedy Ibrahim,S.Kom.', 'Private Address', '081234567890']])])->assertCreated();
        $guest = WeddingInvitee::first();
        $path = '/api/invitations/'.$guest->short_code;
        $this->getJson($path)->assertNotFound();
        $w->update(['status' => 'PUBLISHED']);
        $w->order->update(['status' => 'PUBLISHED']);
        $w->settings()->update(['enable_rsvp' => true]);
        $data = $this->getJson($path)->assertOk()->assertHeader('Cache-Control', 'no-store, private')->json('data');
        $this->assertSame($guest->name, $data['guest']['name']);
        $this->assertSame($guest->token, $data['guest']['token']);
        $this->assertArrayNotHasKey('whatsapp', $data['guest']);
        $this->assertArrayNotHasKey('address', $data['guest']);
        $this->get('/i/'.$guest->short_code)->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get('/w/'.$w->slug.'?to=OldName&guest='.$guest->token)->assertRedirect($guest->invitationUrl($w));
        $this->getJson('/api/guest-passes/'.$guest->token)->assertOk()->assertJsonPath('data.invitation_url', $guest->invitationUrl($w));
        $this->postJson('/api/weddings/'.$w->slug.'/rsvp', ['guest_token' => $guest->token, 'name' => 'Ignored name', 'guests' => 2, 'attendance' => 'Hadir', 'message' => 'Insya Allah hadir'])->assertCreated();
        $this->assertDatabaseHas('wedding_rsvps', ['wedding_invitee_id' => $guest->id, 'name' => $guest->name]);
        $w->update(['slug' => 'new-event-slug']);
        $this->getJson($path)->assertOk()->assertJsonPath('data.slug', 'new-event-slug');
        $w->update(['expires_at' => now()->subDay()]);
        $this->getJson($path)->assertStatus(410);
        $this->get('/i/'.$guest->short_code)->assertStatus(410);
        $w->update(['expires_at' => null]);
        $w->order->update(['status' => 'CANCELLED']);
        $this->getJson($path)->assertNotFound();
        $this->get('/i/'.$guest->short_code)->assertNotFound();
    }

    public function test_short_link_migration_preserves_legacy_tokens_timestamps_and_licenses(): void
    {
        $w = $this->wedding();
        $this->postJson($this->path($w, 'invitees/import'), ['file' => $this->csv(['nama', 'alamat'], [['Legacy Guest', 'Bogor']])])->assertCreated();
        $guest = WeddingInvitee::first();
        $before = $guest->getRawOriginal();
        unset($before['whatsapp'], $before['short_code']);
        $guard = app(DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('c', 40));
        $migration = require database_path('migrations/2026_10_04_000014_add_guest_whatsapp_and_short_links.php');
        $migration->down();
        $migration->up();
        $this->assertSame($before, array_intersect_key($guest->fresh()->getRawOriginal(), $before));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{16}$/', $guest->fresh()->short_code);
        $guard->assertPreserved($backup);
    }
}
