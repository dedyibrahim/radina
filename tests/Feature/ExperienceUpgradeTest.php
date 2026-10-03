<?php

namespace Tests\Feature;

use App\Http\Resources\WeddingResource;
use App\Models\MusicTrack;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExperienceUpgradeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('radina_wedding_test', config('database.connections.mysql.database'));
        Storage::fake('public');
        $this->seed();
    }

    private function admin(): void
    {
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    private function payload(Wedding $w): array
    {
        $data = (new WeddingResource($w->loadContent()))->resolve();
        foreach ($data['events'] as &$event) {
            $event['start_time'] = substr($event['start_time'], 0, 5);
            $event['end_time'] = substr($event['end_time'], 0, 5);
        } $data['expected_updated_at'] = $w->updated_at->toJSON();

        return $data;
    }

    public function test_library_requires_admin_and_valid_audio_and_category(): void
    {
        $this->getJson('/api/admin/music')->assertUnauthorized();
        $this->admin();
        $data = ['title' => 'Owned Piano', 'artist' => 'Test', 'file_url' => '/music/wedding-song.mp3', 'category' => 'Piano', 'duration' => 48, 'is_active' => true, 'is_featured' => true];
        $id = $this->postJson('/api/admin/music', $data)->assertCreated()->json('data.id');
        $this->putJson('/api/admin/music/'.$id, array_replace($data, ['is_active' => false]))->assertOk()->assertJsonPath('data.is_active', false);
        $this->postJson('/api/admin/music', array_replace($data, ['file_url' => 'javascript:alert(1)']))->assertUnprocessable();
        $this->postJson('/api/admin/music', array_replace($data, ['category' => 'INVALID']))->assertUnprocessable();
        $this->postJson('/api/admin/media', ['collection' => 'music-library', 'files' => [UploadedFile::fake()->image('not-a-song.jpg')]])->assertUnprocessable();
        $this->deleteJson('/api/admin/music/'.$id)->assertOk();
        $this->assertDatabaseMissing('music_library', ['id' => $id]);
    }

    public function test_playlist_and_section_edits_survive_template_change_and_deleted_tracks(): void
    {
        $this->admin();
        $w = Wedding::where('slug', 'demo-romantic-floral')->first();
        $track = MusicTrack::create(['title' => 'Original', 'artist' => 'Owned', 'file_url' => '/music/wedding-song.mp3', 'category' => 'Piano', 'is_active' => true, 'is_featured' => false]);
        $data = $this->payload($w);
        $data['music']['playlist'] = [['library_id' => $track->id, 'title' => 'Client title', 'url' => 'https://wrong.example/song.mp3']];
        $data['music']['shuffle'] = true;
        $data['music']['repeat'] = false;
        $data['section_content'] = ['event' => ['enabled' => true, 'heading' => 'Our custom event', 'subheading' => 'Keep this', 'content' => 'Our own words']];
        $data['section_order'] = ['home', 'gallery', 'couple', 'event', 'gift', 'rsvp', 'closing'];
        $this->putJson('/api/admin/weddings/'.$w->id, $data)->assertOk()->assertJsonPath('data.music.playlist.0.url', '/music/wedding-song.mp3')->assertJsonPath('data.music.playlist.0.title', 'Original');
        $this->deleteJson('/api/admin/music/'.$track->id)->assertOk();
        $w->refresh();
        $data = $this->payload($w);
        $data['template_id'] = Template::where('template_key', 'sakinah')->first()->id;
        $this->putJson('/api/admin/weddings/'.$w->id, $data)->assertOk()->assertJsonPath('data.section_content.event.heading', 'Our custom event')->assertJsonPath('data.section_order.1', 'gallery')->assertJsonPath('data.music.playlist.0.url', '/music/wedding-song.mp3')->assertJsonPath('data.music.shuffle', true)->assertJsonPath('data.music.repeat', false);
        $w->refresh();
        $data = $this->payload($w);
        $data['section_order'] = ['home', 'home'];
        $this->putJson('/api/admin/weddings/'.$w->id, $data)->assertUnprocessable();
        $data['section_order'] = ['home', '42'];
        $this->putJson('/api/admin/weddings/'.$w->id, $data)->assertUnprocessable();
        $data = $this->payload($w);
        $data['music']['playlist'] = array_fill(0, 11, ['title' => 'Custom', 'url' => '/music/wedding-song.mp3']);
        $this->putJson('/api/admin/weddings/'.$w->id, $data)->assertUnprocessable();
    }

    public function test_twenty_demos_have_distinct_couples_and_content(): void
    {
        $this->assertSame(6, MusicTrack::count());
        $this->getJson('/api/templates?sort=popular')->assertOk()->assertJsonPath('meta.total', 20);
        $this->getJson('/api/categories')->assertOk()->assertJsonCount(11, 'data');
        $names = [];
        $openings = [];
        $music = [];
        foreach (Template::all() as $template) {
            $data = $this->getJson('/api/templates/'.$template->slug.'/preview')->assertOk()->json('data');
            $names[] = $data['bride']['nickname'];
            $openings[] = $data['opening_text'];
            $music[] = $data['music']['playlist'][0]['url'];
            $this->assertNotEmpty($data['section_content']);
            $this->assertCount(6, $data['gallery']);
            $this->assertTrue($data['is_demo']);
        }
        $this->assertCount(20, array_unique($names));
        $this->assertCount(20, array_unique($openings));
        $this->assertCount(6, array_unique($music));
        foreach (array_unique($music) as $url) {
            $this->assertMatchesRegularExpression('~^/storage/music-library/radina-0[1-6]\\.mp3$~', $url);
        }
    }
}
