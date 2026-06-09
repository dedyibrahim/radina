<?php

namespace Tests\Feature;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_writer_dashboard_only_exposes_writing_features(): void
    {
        $writer = User::where('email', 'shara@radina.net')->firstOrFail();

        $this
            ->actingAs($writer)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('isAdmin', false)
                ->where('activeSection', 'news')
                ->where('auth.user.role', User::ROLE_WRITER)
                ->has('categories', 7)
                ->has('users', 0)
                ->has('licenses.data', 0)
            );
    }

    public function test_writer_cannot_access_admin_management_routes(): void
    {
        $writer = User::where('email', 'shara@radina.net')->firstOrFail();
        $category = NewsCategory::firstOrFail();

        $this->actingAs($writer)->get(route('admin.news.index'))->assertForbidden();
        $this->actingAs($writer)->post(route('licenses.store'), [])->assertForbidden();
        $this->actingAs($writer)->post(route('admin.categories.store'), [])->assertForbidden();
        $this->actingAs($writer)->post(route('admin.users.store'), [])->assertForbidden();
        $this->actingAs($writer)->delete(route('admin.categories.destroy', $category))->assertForbidden();
    }

    public function test_writer_submissions_are_always_saved_as_drafts(): void
    {
        $writer = User::where('email', 'shara@radina.net')->firstOrFail();
        $category = NewsCategory::firstOrFail();

        $this
            ->actingAs($writer)
            ->post(route('admin.news.store'), [
                'category_id' => $category->id,
                'title' => 'Tulisan Baru dari Penulis',
                'excerpt' => 'Tulisan ini harus masuk sebagai draft.',
                'content' => 'Isi tulisan dari akun penulis.',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
                'status' => NewsArticle::STATUS_PUBLISHED,
                'is_featured' => true,
                'published_at' => now()->format('Y-m-d H:i:s'),
                'redirect_to' => 'dashboard',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'news']));

        $article = NewsArticle::where('title', 'Tulisan Baru dari Penulis')->firstOrFail();

        $this->assertSame($writer->id, $article->user_id);
        $this->assertSame(NewsArticle::STATUS_DRAFT, $article->status);
        $this->assertFalse($article->is_featured);
        $this->assertNull($article->published_at);
    }

    public function test_admin_can_create_update_and_delete_user_accounts(): void
    {
        $admin = User::where('email', 'admin@radina.net')->firstOrFail();

        $this
            ->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Penulis Baru',
                'email' => 'penulis.baru@radina.net',
                'role' => User::ROLE_WRITER,
                'password' => 'Password@123',
                'password_confirmation' => 'Password@123',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'users']));

        $account = User::where('email', 'penulis.baru@radina.net')->firstOrFail();
        $this->assertSame(User::ROLE_WRITER, $account->role);
        $this->assertNotNull($account->email_verified_at);

        $this
            ->actingAs($admin)
            ->patch(route('admin.users.update', $account), [
                'name' => 'Administrator Baru',
                'email' => 'admin.baru@radina.net',
                'role' => User::ROLE_ADMIN,
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'users']));

        $account->refresh();
        $this->assertSame(User::ROLE_ADMIN, $account->role);

        $this
            ->actingAs($admin)
            ->delete(route('admin.users.destroy', $account))
            ->assertRedirect(route('dashboard', ['section' => 'users']));

        $this->assertDatabaseMissing('users', ['id' => $account->id]);
    }
}
