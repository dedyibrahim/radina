<?php

namespace App\Http\Controllers;

use App\Models\Wedding;
use App\Services\MediaUploadService;
use App\Services\WeddingService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    public function store(Request $request, WeddingService $service, MediaUploadService $uploads)
    {
        $data = $request->validate(['wedding_id' => 'nullable|exists:weddings,id', 'collection' => ['required', Rule::in(['couple', 'gallery', 'music', 'covers', 'story', 'templates', 'logo', 'video', 'gift', 'music-library', 'music-cover'])],
            'files' => 'required|array|min:1|max:20', 'files.*' => 'required|file|max:30720']);
        $wedding = isset($data['wedding_id']) ? Wedding::findOrFail($data['wedding_id']) : null;
        if ($wedding) {
            $service->ensurePaid($wedding->order);
        }
        abort_if(! $wedding && ! in_array($data['collection'], ['templates', 'logo', 'music-library', 'music-cover']), 422, 'Media undangan memerlukan wedding_id.');
        $result = $uploads->store($request->file('files'), $data['collection'], $wedding, $request->user()->id);

        return response()->json(['data' => $result], 201);
    }
}
