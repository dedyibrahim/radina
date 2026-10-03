<?php

namespace App\Services;

use App\Models\MusicTrack;
use App\Models\Wedding;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MusicCatalogService
{
    public function catalog(): array
    {
        $tracks = json_decode(File::get(base_path('frontend/public/music/library/catalog.json')), true, 512, JSON_THROW_ON_ERROR);
        if (! is_array($tracks) || ! array_is_list($tracks) || count($tracks) !== 6) {
            throw new RuntimeException('The replacement music catalog must contain all six supplied tracks.');
        }
        foreach ($tracks as $track) {
            $name = basename($track['file_url'] ?? '');
            $path = base_path('frontend/public/music/library/'.$name);
            if (! preg_match('/^radina-0[1-6]\.mp3$/', $name)
                || ! is_file($path)
                || filesize($path) !== ($track['bytes'] ?? null)
                || ! hash_equals($track['sha256'] ?? '', hash_file('sha256', $path))) {
                throw new RuntimeException('A supplied music file is missing or corrupted; catalog replacement stopped.');
            }
        }
        if (count(array_unique(array_column($tracks, 'file_url'))) !== count($tracks)) {
            throw new RuntimeException('The replacement catalog contains duplicate file paths.');
        }

        return $tracks;
    }

    public function installFiles(): void
    {
        $disk = Storage::disk('public');
        foreach ($this->catalog() as $track) {
            $target = 'music-library/'.basename($track['file_url']);
            if ($disk->exists($target) && hash_equals($track['sha256'], hash('sha256', $disk->get($target)))) {
                continue;
            }
            if (! $disk->put($target, File::get(base_path('frontend/public/music/library/'.basename($track['file_url']))))
                || ! hash_equals($track['sha256'], hash('sha256', $disk->get($target)))) {
                throw new RuntimeException('A supplied music file could not be installed; catalog replacement stopped.');
            }
        }
    }

    public function playlist(array $tracks): array
    {
        return array_map(fn (MusicTrack $track) => ['library_id' => $track->id, 'title' => $track->title, 'artist' => $track->artist,
            'url' => $track->file_url, 'cover' => $track->cover_image, 'duration' => $track->duration], $tracks);
    }

    // Called only by the one-time data migration, never during routine seeding.
    public function replace(): void
    {
        $catalog = $this->catalog();
        $this->installFiles();
        DB::transaction(function () use ($catalog) {
            $oldTracks = DB::table('music_library')->orderBy('id')->lockForUpdate()->get();
            $weddings = Wedding::orderBy('id')->lockForUpdate()->get();
            $snapshot = ['version' => 1, 'created_at' => now()->toIso8601String(), 'music_library' => $oldTracks->all(),
                'weddings' => $weddings->map(fn ($wedding) => $wedding->only(['id', 'music_url', 'music_playlist', 'updated_at']))->all()];
            $contents = Crypt::encryptString(json_encode($snapshot, JSON_THROW_ON_ERROR));
            $backup = Storage::build(['driver' => 'local', 'root' => storage_path('app'), 'throw' => true]);
            $path = 'music-catalog-backups/'.gmdate('Ymd-His').'-'.bin2hex(random_bytes(8)).'.encrypted';
            if (! $backup->put($path, $contents) || ! hash_equals(hash('sha256', $contents), hash('sha256', $backup->get($path)))) {
                throw new RuntimeException('The previous music catalog could not be backed up; replacement stopped.');
            }

            MusicTrack::query()->delete();
            $tracks = [];
            foreach ($catalog as $entry) {
                $values = collect($entry)->only(['title', 'artist', 'category', 'duration', 'is_active', 'is_featured'])->all();
                $values['file_url'] = '/storage/music-library/'.basename($entry['file_url']);
                $tracks[] = MusicTrack::create($values);
            }
            foreach ($weddings as $index => $wedding) {
                $count = $wedding->is_demo ? 2 : max(1, min(count($wedding->music_playlist ?? []), count($tracks)));
                $selected = [];
                for ($i = 0; $i < $count; $i++) {
                    $selected[] = $tracks[($index + $i) % count($tracks)];
                }
                $wedding->update(['music_url' => $selected[0]->file_url, 'music_playlist' => $this->playlist($selected)]);
            }
        }, 3);
    }
}
