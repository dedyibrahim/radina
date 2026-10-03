<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Wedding;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUploadService
{
    public function store(array $files, string $collection, ?Wedding $wedding, int $uploadedBy, string $subdirectory = ''): array
    {
        $audio = in_array($collection, ['music', 'music-library']);
        $video = $collection === 'video';
        $allowed = $audio ? ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'] : ($video ? ['video/mp4'] : ['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
        foreach ($files as $file) {
            abort_unless(in_array($file->getMimeType(), $allowed), 422, 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, AVIF, MP3, WAV, OGG, atau MP4 sesuai kolom.');
            if (! $audio && ! $video) {
                abort_if($file->getSize() > 12 * 1024 * 1024, 422, 'Ukuran gambar maksimal 12 MB.');
                $dimensions = getimagesize($file->getRealPath());
                abort_unless($dimensions && $dimensions[0] * $dimensions[1] <= 24000000, 422, 'Resolusi gambar terlalu besar (maksimal 24 megapiksel).');
            }
        }
        $paths = [];
        try {
            return DB::transaction(function () use ($files, $collection, $wedding, $uploadedBy, $subdirectory, $audio, $video, &$paths) {
                $result = [];
                $directory = $wedding ? 'weddings/'.$wedding->id.'/'.($subdirectory ? $subdirectory.'/' : '').$collection : $collection;
                foreach ($files as $file) {
                    if (! $audio && ! $video) {
                        $image = imagecreatefromstring(file_get_contents($file->getRealPath()));
                        abort_unless($image, 422, 'Gambar tidak dapat diproses.');
                        $scale = min(1, 1600 / max(imagesx($image), imagesy($image)));
                        $resized = imagescale($image, (int) max(1, imagesx($image) * $scale), (int) max(1, imagesy($image) * $scale));
                        ob_start();
                        imagewebp($resized, null, 82);
                        $bytes = ob_get_clean();
                        unset($resized, $image);
                        $path = $directory.'/'.Str::uuid().'.webp';
                        $paths[] = $path;
                        if (! Storage::disk('public')->put($path, $bytes)) {
                            throw new \RuntimeException('Unable to store uploaded image.');
                        }
                    } else {
                        $extension = $video ? 'mp4' : match ($file->getMimeType()) {
                            'audio/mpeg', 'audio/mp3' => 'mp3', 'audio/ogg' => 'ogg', default => 'wav'
                        };
                        $path = $file->storeAs($directory, Str::uuid().'.'.$extension, 'public');
                        if (! $path) {
                            throw new \RuntimeException('Unable to store uploaded media.');
                        }
                        $paths[] = $path;
                    }
                    $size = Storage::disk('public')->size($path);
                    $mime = $audio || $video ? $file->getMimeType() : 'image/webp';
                    $media = Media::create(['wedding_id' => $wedding?->id, 'uploaded_by' => $uploadedBy, 'collection' => $collection, 'path' => $path, 'mime_type' => $mime, 'size' => $size]);
                    $result[] = ['id' => $media->id, 'url' => '/storage/'.$path, 'mime_type' => $mime, 'size' => $size];
                }

                return $result;
            });
        } catch (\Throwable $error) {
            Storage::disk('public')->delete($paths);
            throw $error;
        }
    }
}
