<?php

namespace Tests\Feature;

use App\Models\MusicTrack;
use App\Models\Wedding;
use App\Services\DeploymentLicenseGuard;
use App\Services\MusicCatalogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MusicCatalogReplacementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
    }

    public function test_replacement_backs_up_all_music_and_updates_customer_and_demo_playlists_without_changing_license_or_playback_settings(): void
    {
        $old = MusicTrack::create(['title' => 'Old customer audio', 'artist' => 'Old artist', 'file_url' => '/storage/old-audio.mp3', 'category' => 'Piano', 'is_active' => true]);
        $wedding = Wedding::where('slug', 'demo-romantic-floral')->first();
        $playlist = [['library_id' => $old->id, 'title' => $old->title, 'url' => $old->file_url], ['title' => 'External audio', 'url' => 'https://example.com/old.mp3']];
        $wedding->update(['is_demo' => false, 'music_url' => $old->file_url, 'music_playlist' => $playlist, 'volume' => 17, 'music_shuffle' => true, 'music_repeat' => false, 'autoplay_after_open' => false]);
        $guard = app(DeploymentLicenseGuard::class);
        $licenses = $guard->backup(str_repeat('a', 40));
        $private = Storage::build(['driver' => 'local', 'root' => storage_path('app')]);
        $previous = $private->files('music-catalog-backups');

        app(MusicCatalogService::class)->replace();

        $this->assertSame(6, MusicTrack::count());
        $this->assertDatabaseMissing('music_library', ['id' => $old->id]);
        $wedding->refresh();
        $this->assertCount(2, $wedding->music_playlist);
        $this->assertSame($wedding->music_playlist[0]['url'], $wedding->music_url);
        $this->assertSame(17, $wedding->volume);
        $this->assertTrue($wedding->music_shuffle);
        $this->assertFalse($wedding->music_repeat);
        $this->assertFalse($wedding->autoplay_after_open);
        foreach (Wedding::all() as $entry) {
            $this->assertMatchesRegularExpression('~^/storage/music-library/radina-0[1-6]\\.mp3$~', $entry->music_url);
            foreach ($entry->music_playlist as $track) {
                $this->assertNotNull(MusicTrack::find($track['library_id']));
                $this->assertSame($track['url'], MusicTrack::find($track['library_id'])->file_url);
            }
        }
        $guard->assertPreserved($licenses);
        $new = array_values(array_diff($private->files('music-catalog-backups'), $previous));
        $this->assertCount(1, $new);
        $backup = json_decode(Crypt::decryptString($private->get($new[0])), true, 512, JSON_THROW_ON_ERROR);
        $saved = collect($backup['weddings'])->firstWhere('id', $wedding->id);
        $this->assertEquals($playlist, $saved['music_playlist']);
        $this->assertSame($old->file_url, $saved['music_url']);
        $this->assertSame($old->title, collect($backup['music_library'])->firstWhere('id', $old->id)['title']);
    }

    public function test_all_six_installed_files_match_supplied_hashes_and_reseeding_preserves_admin_changes(): void
    {
        $service = app(MusicCatalogService::class);
        foreach ($service->catalog() as $track) {
            $path = 'music-library/'.basename($track['file_url']);
            $this->assertSame($track['sha256'], hash('sha256', Storage::disk('public')->get($path)));
            $this->assertGreaterThan(180, $track['duration']);
        }
        $track = MusicTrack::orderBy('id')->first();
        $track->update(['title' => 'Customer chosen title', 'is_active' => false]);
        $deleted = MusicTrack::orderByDesc('id')->first();
        $deleted->delete();
        $custom = MusicTrack::create(['title' => 'Later admin upload', 'file_url' => '/storage/custom.mp3', 'category' => 'Piano', 'is_active' => true]);
        $wedding = Wedding::where('slug', 'demo-romantic-floral')->first();
        $wedding->update(['is_demo' => false, 'music_url' => $custom->file_url, 'music_playlist' => $service->playlist([$custom])]);
        $before = MusicTrack::orderBy('id')->get()->toArray();
        $playlist = $wedding->refresh()->music_playlist;

        $this->seed();

        $this->assertSame($before, MusicTrack::orderBy('id')->get()->toArray());
        $this->assertSame($playlist, $wedding->refresh()->music_playlist);
        $this->assertSame($custom->file_url, $wedding->music_url);
        $this->assertDatabaseMissing('music_library', ['id' => $deleted->id]);
    }

    public function test_upload_failure_stops_before_removing_library_or_replacing_playlists(): void
    {
        $library = MusicTrack::orderBy('id')->get()->toArray();
        $weddings = Wedding::orderBy('id')->get()->toArray();
        Storage::disk('public')->delete('music-library/radina-01.mp3');
        Storage::shouldReceive('disk')->with('public')->andReturn(new class
        {
            public function exists($path): bool { return false; }
            public function put($path, $data): bool { return false; }
        });
        try {
            app(MusicCatalogService::class)->replace();
            $this->fail('An incomplete audio upload must stop replacement.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('could not be installed', $exception->getMessage());
        }
        $this->assertSame($library, MusicTrack::orderBy('id')->get()->toArray());
        $this->assertSame($weddings, Wedding::orderBy('id')->get()->toArray());
    }
}
