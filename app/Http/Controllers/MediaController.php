<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Wedding;
use App\Services\WeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    public function store(Request $request, WeddingService $service)
    {
        $data = $request->validate(['wedding_id' => 'nullable|exists:weddings,id', 'collection' => ['required', Rule::in(['couple', 'gallery', 'music', 'covers', 'story', 'templates', 'logo', 'video', 'gift', 'music-library', 'music-cover'])],
            'files' => 'required|array|min:1|max:20', 'files.*' => 'required|file|max:30720']);
        $wedding = isset($data['wedding_id']) ? Wedding::findOrFail($data['wedding_id']) : null;
        if ($wedding) {
            $service->ensurePaid($wedding->order);
        }
        abort_if(! $wedding && ! in_array($data['collection'], ['templates', 'logo', 'music-library', 'music-cover']), 422, 'Media undangan memerlukan wedding_id.');
        $result = [];
        foreach ($request->file('files') as $file) {
            $collection = $data['collection'];
            $mime = $file->getMimeType();
            $audio = in_array($collection, ['music', 'music-library']);
            $video = $collection === 'video';
            $allowed = $audio ? ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'] : ($video ? ['video/mp4'] : ['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
            abort_unless(in_array($mime, $allowed, true), 422, 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, AVIF, MP3, WAV, OGG, atau MP4 sesuai kolom.');
            abort_if(! $audio && ! $video && $file->getSize() > 12 * 1024 * 1024, 422, 'Ukuran gambar maksimal 12 MB.');
            $directory = $wedding ? 'weddings/'.$wedding->id.'/'.$collection : $collection;
            if (! $audio && ! $video) {
                $dimensions = getimagesize($file->getRealPath());
                abort_unless($dimensions && $dimensions[0] * $dimensions[1] <= 24000000, 422, 'Resolusi gambar terlalu besar (maksimal 24 megapiksel).');
                $image = imagecreatefromstring(file_get_contents($file->getRealPath()));
                abort_unless($image, 422, 'Gambar tidak dapat diproses.');
                $scale = min(1, 1600 / max(imagesx($image), imagesy($image)));
                $resized = imagescale($image, (int) max(1, imagesx($image) * $scale), (int) max(1, imagesy($image) * $scale));
                ob_start();
                imagewebp($resized, null, 82);
                $bytes = ob_get_clean();
                $path = $directory.'/'.Str::uuid().'.webp';
                Storage::disk('public')->put($path, $bytes);
            } else {
                $extension = $video ? 'mp4' : match ($mime) {
                    'audio/mpeg','audio/mp3' => 'mp3','audio/ogg' => 'ogg',default => 'wav'
                };
                $path = $file->storeAs($directory, Str::uuid().'.'.$extension, 'public');
            }
            $media = Media::create(['wedding_id' => $wedding?->id, 'uploaded_by' => $request->user()->id, 'collection' => $collection, 'path' => $path, 'mime_type' => $audio || $video ? $mime : 'image/webp', 'size' => Storage::disk('public')->size($path)]);
            $result[] = ['id' => $media->id, 'url' => '/storage/'.$path, 'mime_type' => $media->mime_type, 'size' => $media->size];
        }

        return response()->json(['data' => $result], 201);
    }
}
