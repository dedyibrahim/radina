<?php

namespace Tests\Feature;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\User;
use App\Models\WriterEarning;
use App\Models\WriterWithdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WriterPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_writer_is_credited_once_after_article_is_approved_and_fact_verified(): void
    {
        $admin = User::where('email', 'admin@radina.net')->firstOrFail();
        $writer = User::where('email', 'nadia@radina.net')->firstOrFail();
        $category = NewsCategory::firstOrFail();

        $writer->update(['article_fee' => 60000]);

        $this
            ->actingAs($writer)
            ->post(route('admin.news.store'), [
                'category_id' => $category->id,
                'title' => 'Artikel Baru untuk Review Pembayaran',
                'excerpt' => 'Artikel ini harus melalui persetujuan dan verifikasi fakta.',
                'content' => 'Isi artikel pengujian pembayaran penulis.',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
                'status' => NewsArticle::STATUS_PUBLISHED,
                'is_featured' => true,
                'redirect_to' => 'dashboard',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'news']));

        $article = NewsArticle::where('title', 'Artikel Baru untuk Review Pembayaran')->firstOrFail();
        $this->assertSame(NewsArticle::STATUS_DRAFT, $article->status);

        $this
            ->actingAs($admin)
            ->patch(route('admin.news.review', $article), [
                'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                'fact_check_status' => NewsArticle::FACT_PENDING,
                'review_note' => 'Editorial sudah sesuai, menunggu pemeriksaan fakta.',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('writer_earnings', ['article_id' => $article->id]);

        $this
            ->actingAs($admin)
            ->patch(route('admin.news.review', $article), [
                'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                'fact_check_status' => NewsArticle::FACT_VERIFIED,
                'review_note' => 'Sumber dan fakta telah diverifikasi.',
            ])
            ->assertSessionHasNoErrors();

        $article->refresh();
        $this->assertSame(NewsArticle::STATUS_PUBLISHED, $article->status);
        $this->assertDatabaseHas('writer_earnings', [
            'article_id' => $article->id,
            'user_id' => $writer->id,
            'amount' => 60000,
        ]);

        $this
            ->actingAs($admin)
            ->patch(route('admin.news.review', $article), [
                'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                'fact_check_status' => NewsArticle::FACT_VERIFIED,
            ]);

        $this->assertSame(1, WriterEarning::where('article_id', $article->id)->count());
    }

    public function test_writer_can_save_bank_account_and_withdraw_when_balance_reaches_minimum(): void
    {
        $writer = User::where('email', 'nadia@radina.net')->firstOrFail();

        $this
            ->actingAs($writer)
            ->patch(route('writer.bank.update'), [
                'bank_name' => 'BCA',
                'bank_account_number' => '9876543210',
                'bank_account_holder' => 'Nadia Pramesti',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'bank']));

        $availableBefore = $writer->fresh()->availableBalance();
        $this->assertGreaterThanOrEqual(50000, $availableBefore);

        $this
            ->actingAs($writer)
            ->post(route('writer.withdrawals.store'), ['amount' => 50000])
            ->assertRedirect(route('dashboard', ['section' => 'earnings']));

        $this->assertDatabaseHas('writer_withdrawals', [
            'user_id' => $writer->id,
            'amount' => 50000,
            'status' => WriterWithdrawal::STATUS_PENDING,
            'bank_account_number' => '9876543210',
        ]);
        $this->assertSame($availableBefore - 50000, $writer->fresh()->availableBalance());
    }

    public function test_withdrawal_below_minimum_is_rejected(): void
    {
        $writer = User::where('email', 'nadia@radina.net')->firstOrFail();

        $this
            ->actingAs($writer)
            ->post(route('writer.withdrawals.store'), ['amount' => 49000])
            ->assertSessionHasErrors('amount');

        $this->assertDatabaseMissing('writer_withdrawals', [
            'user_id' => $writer->id,
            'amount' => 49000,
        ]);
    }

    public function test_article_cannot_be_reassigned_after_earning_is_credited(): void
    {
        $admin = User::where('email', 'admin@radina.net')->firstOrFail();
        $article = NewsArticle::whereHas('earning')->firstOrFail();
        $otherWriter = User::where('role', User::ROLE_WRITER)
            ->whereKeyNot($article->user_id)
            ->firstOrFail();

        $this
            ->actingAs($admin)
            ->patch(route('admin.news.reassign', $article), [
                'assigned_user_id' => $otherWriter->id,
            ])
            ->assertSessionHasErrors('assigned_user_id');

        $this->assertSame($article->user_id, $article->fresh()->user_id);
    }

    public function test_admin_approves_withdrawal_before_marking_it_paid(): void
    {
        $admin = User::where('email', 'admin@radina.net')->firstOrFail();
        $writer = User::where('email', 'nadia@radina.net')->firstOrFail();
        $withdrawal = WriterWithdrawal::create([
            'user_id' => $writer->id,
            'amount' => 50000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => $writer->name,
            'status' => WriterWithdrawal::STATUS_PENDING,
            'requested_at' => now(),
        ]);

        $this
            ->actingAs($admin)
            ->patch(route('admin.withdrawals.update', $withdrawal), [
                'status' => WriterWithdrawal::STATUS_PAID,
            ])
            ->assertSessionHasErrors('status');

        $this
            ->actingAs($admin)
            ->patch(route('admin.withdrawals.update', $withdrawal), [
                'status' => WriterWithdrawal::STATUS_APPROVED,
                'admin_note' => 'Rekening sudah diperiksa.',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'payments']));

        $this
            ->actingAs($admin)
            ->patch(route('admin.withdrawals.update', $withdrawal->fresh()), [
                'status' => WriterWithdrawal::STATUS_PAID,
                'admin_note' => 'Transfer selesai.',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'payments']));

        $withdrawal->refresh();
        $this->assertSame(WriterWithdrawal::STATUS_PAID, $withdrawal->status);
        $this->assertSame($admin->id, $withdrawal->processed_by);
        $this->assertNotNull($withdrawal->processed_at);
    }
}
