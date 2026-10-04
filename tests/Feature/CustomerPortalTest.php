<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingCustomerPortal;
use App\Models\WeddingInvitee;
use App\Services\CustomerPortalService;
use App\Services\DeploymentLicenseGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        $this->admin();
    }

    private function admin(): void
    {
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    private function wedding(string $slug = 'customer-portal-test'): Wedding
    {
        $order = Order::create(['template_id' => Template::first()->id, 'order_number' => 'WD-'.$slug, 'customer_name' => 'Customer Portal', 'whatsapp' => '6281234567890', 'bride_name' => 'Shara Ibrahim', 'groom_name' => 'Dedy Ibrahim', 'slug' => $slug, 'total' => 149000, 'status' => 'PAID']);
        $order->payment()->create(['amount' => 149000, 'status' => 'PAID']);
        $id = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->assertCreated()->json('data.id');

        return Wedding::findOrFail($id);
    }

    private function token(Wedding $w): string
    {
        return basename($this->postJson($this->adminPath($w))->assertOk()->json('data.link'));
    }

    private function adminPath(Wedding $w, string $suffix = ''): string
    {
        return '/api/admin/weddings/'.$w->id.'/customer-portal'.$suffix;
    }

    private function customerPath(string $token, string $suffix = ''): string
    {
        return '/api/customer-portals/'.$token.$suffix;
    }

    private function data(Wedding $w): array
    {
        $data = app(CustomerPortalService::class)->initial($w);
        $data['wedding_date'] = '2026-12-20';
        $data['events'] = [['type' => 'akad', 'title' => 'Akad Nikah', 'date' => '2026-12-20', 'start_time' => '09:00', 'end_time' => '10:00', 'timezone' => 'Asia/Jakarta', 'venue' => 'Gedung Jakarta', 'address' => 'Jalan Mawar 1', 'google_maps_url' => 'https://maps.google.com/']];

        return $data;
    }

    private function submitAndApply(Wedding $w, string $token): void
    {
        $this->putJson($this->customerPath($token), ['data' => $this->data($w), 'expected_submission_version' => 0, 'submit' => true])->assertOk()->assertJsonPath('data.status', 'SUBMITTED');
        $this->postJson($this->adminPath($w, '/apply'), ['expected_updated_at' => $w->updated_at->toJSON(), 'expected_submission_version' => 1])->assertOk()->assertJsonPath('data.portal.status', 'IN_REVIEW');
    }

    public function test_private_link_is_encrypted_scoped_and_customer_cannot_access_admin(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $portal = WeddingCustomerPortal::first();
        $this->assertSame(64, strlen($token));
        $this->assertSame(hash('sha256', $token), $portal->token_hash);
        $this->assertNotSame($token, $portal->getRawOriginal('token'));
        $this->getJson($this->customerPath($token))->assertOk()->assertJsonPath('data.form.bride.full_name', 'Shara Ibrahim')->assertHeader('Cache-Control', 'no-store, private');
        $this->getJson($this->customerPath(str_repeat('0', 64)))->assertNotFound();
        $preview = $this->getJson($this->customerPath($token, '/preview'))->assertOk()->json('data.wedding');
        $this->assertArrayNotHasKey('customer_whatsapp', $preview);
        Sanctum::actingAs(User::factory()->create());
        $this->postJson($this->adminPath($w))->assertForbidden();
        $this->postJson($this->adminPath($w, '/apply'))->assertForbidden();
        $this->getJson('/api/admin/licenses')->assertForbidden();
    }

    public function test_customer_guest_csv_is_scoped_idempotent_private_and_does_not_invalidate_preview(): void
    {
        $w = $this->wedding('customer-guests');
        $other = $this->wedding('other-guests');
        $token = $this->token($w);
        $otherToken = $this->token($other);
        $path = $this->customerPath($token, '/invitees');
        $fingerprint = CustomerPortalService::fingerprint($w->fresh());
        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/admin/weddings/'.$w->id.'/invitees/import')->assertForbidden();
        $this->get($path.'/template')->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $csv = fn () => UploadedFile::fake()->createWithContent('tamu.csv', "nama;alamat\r\nBapak Budi;Jakarta\r\nIbu Ayu;Bandung\r\nBapak Budi;Jakarta\r\n");
        $this->postJson($path.'/preview', ['file' => $csv()])->assertOk()->assertJsonPath('data.new_count', 2)->assertJsonPath('data.duplicate_count', 1);
        $this->assertSame(0, WeddingInvitee::where('wedding_id', $w->id)->count());
        $this->postJson($path.'/import', ['file' => $csv(), 'wedding_id' => $other->id])->assertCreated()->assertJsonPath('data.imported', 2)->assertJsonPath('data.skipped', 1)->assertHeader('Cache-Control', 'no-store, private');
        $this->assertSame(2, WeddingInvitee::where('wedding_id', $w->id)->count());
        $this->assertSame(0, WeddingInvitee::where('wedding_id', $other->id)->count());
        $this->postJson($path.'/import', ['file' => $csv()])->assertCreated()->assertJsonPath('data.imported', 0)->assertJsonPath('data.skipped', 3);
        $this->postJson($this->customerPath($otherToken, '/invitees/import'), ['file' => UploadedFile::fake()->createWithContent('tamu.csv', "nama;alamat\r\nOther Private Guest;Surabaya\r\n")])->assertCreated();
        $list = $this->getJson($path)->assertOk()->assertJsonPath('total', 2)->assertHeader('Referrer-Policy', 'no-referrer');
        $this->assertMatchesRegularExpression('~/i/[a-f0-9]{16}$~', $list->json('data.0.link'));
        $this->assertStringNotContainsString('guest=', $list->json('data.0.link'));
        $this->getJson($path.'?search=Ayu')->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.name', 'Ibu Ayu');
        $export = $this->get($path.'/export')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow')->streamedContent();
        $this->assertStringContainsString('link_undangan', $export);
        $this->assertStringContainsString('Bapak Budi', $export);
        $this->assertStringNotContainsString('Other Private Guest', $export);
        $guestId = $list->json('data.0.id');
        $this->patchJson($path.'/'.$guestId.'/phone', ['whatsapp' => '081234567890', 'expected_whatsapp' => null])->assertOk()->assertJsonPath('data.whatsapp', '6281234567890')->assertHeader('Cache-Control', 'no-store, private');
        $otherGuest = WeddingInvitee::where('wedding_id', $other->id)->first();
        $this->patchJson($path.'/'.$otherGuest->id.'/phone', ['whatsapp' => '081234567899', 'expected_whatsapp' => null])->assertNotFound();
        $this->patchJson($path.'/message', ['message_template' => 'Yth. {nama_tamu}, silakan hadir. {link_undangan}'])->assertOk()->assertHeader('Referrer-Policy', 'no-referrer');
        $this->assertSame($fingerprint, CustomerPortalService::fingerprint($w->fresh()));
        $this->postJson($path.'/import', ['file' => UploadedFile::fake()->createWithContent('tamu.csv', "nama;alamat\r\n<script>;Jakarta\r\n")])->assertUnprocessable();
        $this->postJson($path.'/preview', ['file' => UploadedFile::fake()->createWithContent('tamu.xlsx', 'invalid')])->assertUnprocessable();
        $this->assertSame(2, WeddingInvitee::where('wedding_id', $w->id)->count());
        WeddingCustomerPortal::where('wedding_id', $w->id)->update(['revoked_at' => now()]);
        foreach (['', '/template', '/export'] as $suffix) $this->getJson($path.$suffix)->assertNotFound();
        foreach (['/preview', '/import'] as $suffix) $this->postJson($path.$suffix, ['file' => $csv()])->assertNotFound();
        $this->patchJson($path.'/message', ['message_template' => null])->assertNotFound();
        $this->patchJson($path.'/'.$guestId.'/phone', ['whatsapp' => null, 'expected_whatsapp' => '6281234567890'])->assertNotFound();
    }

    public function test_private_customer_preview_route_preserves_privacy_headers(): void
    {
        $url = '/pelanggan/'.str_repeat('a', 64).'/preview';
        $this->get($url)->assertOk()->assertHeader('Cache-Control', 'no-store, private')->assertHeader('Referrer-Policy', 'no-referrer')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_customer_drafts_are_private_and_submit_requires_complete_valid_content(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $data = app(CustomerPortalService::class)->initial($w);
        $data['bride']['full_name'] = 'Customer Draft Bride';
        $this->putJson($this->customerPath($token), ['data' => $data, 'expected_submission_version' => 0, 'submit' => false])->assertOk()->assertJsonPath('data.status', 'DRAFT')->assertJsonPath('data.submission_version', 1);
        $this->assertSame('Shara Ibrahim', $w->fresh()->couples->firstWhere('role', 'bride')->full_name);
        $this->assertStringNotContainsString('Customer Draft Bride', WeddingCustomerPortal::first()->getRawOriginal('submission'));
        $this->putJson($this->customerPath($token), ['data' => $data, 'expected_submission_version' => 1, 'submit' => true])->assertUnprocessable()->assertJsonValidationErrors(['data.wedding_date', 'data.events']);
        $this->postJson($this->customerPath($token, '/response'), ['decision' => 'approve', 'fingerprint' => CustomerPortalService::fingerprint($w)])->assertUnprocessable();
        $this->getJson('/api/weddings/'.$w->slug)->assertNotFound();
    }

    public function test_submission_apply_approval_and_publish_preserve_license_records(): void
    {
        $w = $this->wedding();
        $guard = app(DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('b', 40));
        $token = $this->token($w);
        $this->submitAndApply($w, $token);
        $this->postJson('/api/admin/weddings/'.$w->id.'/publish')->assertUnprocessable()->assertJsonValidationErrors('customer_approval');
        $preview = $this->getJson($this->customerPath($token, '/preview'))->assertOk();
        $this->postJson($this->customerPath($token, '/response'), ['decision' => 'approve', 'fingerprint' => $preview->json('data.fingerprint')])->assertOk()->assertJsonPath('data.status', 'APPROVED');
        $this->postJson('/api/admin/weddings/'.$w->id.'/publish')->assertOk()->assertJsonPath('data.status', 'PUBLISHED');
        $this->getJson($this->customerPath($token))->assertOk()->assertJsonPath('data.status', 'APPROVED');
        $guard->assertPreserved($backup);
    }

    public function test_stale_preview_is_rejected_and_admin_changes_require_new_approval(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $this->submitAndApply($w, $token);
        $fingerprint = $this->getJson($this->customerPath($token, '/preview'))->json('data.fingerprint');
        $w->fresh()->update(['quote' => 'Updated quote']);
        $this->getJson($this->customerPath($token))->assertOk()->assertJsonPath('data.form.quote', 'Updated quote');
        $this->postJson($this->customerPath($token, '/response'), ['decision' => 'approve', 'fingerprint' => $fingerprint])->assertStatus(409);
        $fresh = $this->getJson($this->customerPath($token, '/preview'))->json('data.fingerprint');
        $this->postJson($this->customerPath($token, '/response'), ['decision' => 'approve', 'fingerprint' => $fresh])->assertOk();
        $w->fresh()->touch();
        $this->getJson($this->customerPath($token))->assertOk()->assertJsonPath('data.status', 'APPROVED');
        $w->fresh()->update(['closing_text' => 'Visible content changed']);
        $this->getJson($this->customerPath($token))->assertOk()->assertJsonPath('data.status', 'IN_REVIEW');
        $this->postJson('/api/admin/weddings/'.$w->id.'/publish')->assertUnprocessable()->assertJsonValidationErrors('customer_approval');
    }

    public function test_revision_notes_are_encrypted_and_displayed_to_admin(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $this->submitAndApply($w, $token);
        $fingerprint = $this->getJson($this->customerPath($token, '/preview'))->json('data.fingerprint');
        $this->postJson($this->customerPath($token, '/response'), ['decision' => 'revision', 'fingerprint' => $fingerprint, 'notes' => 'Ubah nama lokasi menjadi Gedung Mawar.'])->assertOk()->assertJsonPath('data.status', 'CHANGES_REQUESTED');
        $this->getJson($this->adminPath($w))->assertOk()->assertJsonPath('data.revision_notes', 'Ubah nama lokasi menjadi Gedung Mawar.');
        $this->assertStringNotContainsString('Gedung Mawar', WeddingCustomerPortal::first()->getRawOriginal('revision_notes'));
        $this->postJson('/api/admin/weddings/'.$w->id.'/publish')->assertUnprocessable();
    }

    public function test_token_rotation_expiry_revocation_and_cancelled_orders_disable_access(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $rotated = $this->token($w);
        $this->assertNotSame($token, $rotated);
        $this->getJson($this->customerPath($token))->assertNotFound();
        WeddingCustomerPortal::first()->update(['expires_at' => now()->subMinute()]);
        $this->getJson($this->customerPath($rotated))->assertNotFound();
        $renewed = $this->token($w);
        $this->deleteJson($this->adminPath($w))->assertOk();
        $this->getJson($this->customerPath($renewed))->assertNotFound();
        $active = $this->token($w);
        $w->order->update(['status' => 'CANCELLED']);
        $this->getJson($this->customerPath($active))->assertNotFound();
    }

    public function test_customer_cannot_modify_protected_fields_or_other_wedding_media(): void
    {
        $w = $this->wedding();
        $other = $this->wedding('other-customer');
        $token = $this->token($w);
        foreach (['status' => 'PUBLISHED', 'template_id' => Template::first()->id, 'slug' => $other->slug, 'bank_account' => 'malicious'] as $key => $value) {
            $this->putJson($this->customerPath($token), ['data' => $this->data($w) + [$key => $value], 'expected_submission_version' => 0, 'submit' => true])->assertUnprocessable();
        }
        $data = $this->data($w);
        $data['bride']['photo'] = '/storage/weddings/'.$other->id.'/couple/photo.webp';
        $this->putJson($this->customerPath($token), ['data' => $data, 'expected_submission_version' => 0, 'submit' => true])->assertUnprocessable();
        $data['events'] = 'malformed';
        $this->putJson($this->customerPath($token), ['data' => $data, 'expected_submission_version' => 0, 'submit' => false])->assertUnprocessable();
        $this->assertSame('DRAFT', $w->fresh()->status);
        $this->assertSame(0, WeddingCustomerPortal::first()->submission_version);
    }

    public function test_uploads_are_scoped_and_mixed_invalid_batch_does_not_store_anything(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $this->postJson($this->customerPath($token, '/media'), ['collection' => 'gallery', 'wedding_id' => 999999, 'files' => [UploadedFile::fake()->image('photo.jpg', 500, 400)]])->assertOk()->assertJsonPath('data.0.mime_type', 'image/webp');
        $this->assertDatabaseHas('media', ['wedding_id' => $w->id, 'collection' => 'gallery']);
        $fileCount = count(Storage::disk('public')->allFiles());
        $this->postJson($this->customerPath($token, '/media'), ['collection' => 'gallery', 'files' => [UploadedFile::fake()->image('valid.png'), UploadedFile::fake()->create('evil.php', 1, 'application/x-php')]])->assertUnprocessable();
        $this->assertSame($fileCount, count(Storage::disk('public')->allFiles()));
        $this->assertSame(1, $w->media()->count());
        $this->postJson($this->customerPath($token, '/media'), ['collection' => 'logo', 'files' => [UploadedFile::fake()->image('logo.png')]])->assertUnprocessable();
    }

    public function test_customer_and_admin_optimistic_versions_prevent_overwrite(): void
    {
        $w = $this->wedding();
        $token = $this->token($w);
        $data = $this->data($w);
        $this->putJson($this->customerPath($token), ['data' => $data, 'expected_submission_version' => 0, 'submit' => true])->assertOk();
        $this->putJson($this->customerPath($token), ['data' => $data, 'expected_submission_version' => 0, 'submit' => false])->assertStatus(409);
        $this->postJson($this->adminPath($w, '/apply'), ['expected_updated_at' => $w->updated_at->toJSON(), 'expected_submission_version' => 2])->assertStatus(409);
        $version = $w->updated_at->toJSON();
        $w->touch();
        $this->postJson($this->adminPath($w, '/apply'), ['expected_updated_at' => $version, 'expected_submission_version' => 1])->assertStatus(409);
        $this->assertNull($w->fresh()->wedding_date);
        $this->assertSame('SUBMITTED', WeddingCustomerPortal::first()->status);
    }
}
