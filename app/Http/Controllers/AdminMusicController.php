<?php

namespace App\Http\Controllers;

use App\Models\MusicTrack;
use App\Rules\SafeMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminMusicController extends Controller
{
    public function index(Request $request)
    {
        $query = MusicTrack::query();
        if ($request->filled('search')) {
            $term = '%'.mb_substr($request->string('search'), 0, 120).'%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('artist', 'like', $term));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        return response()->json(['data' => $query->orderByDesc('is_featured')->orderBy('title')->get(), 'categories' => MusicTrack::CATEGORIES]);
    }

    public function store(Request $request)
    {
        return response()->json(['data' => MusicTrack::create($this->validated($request))], 201);
    }

    public function update(Request $request, MusicTrack $music)
    {
        $music->update($this->validated($request));

        return response()->json(['data' => $music->fresh()]);
    }

    public function destroy(MusicTrack $music)
    {
        // Playlist snapshots retain their licensed media; never unlink a file used by a published invitation.
        $music->delete();

        return response()->json(['message' => 'Lagu dihapus dari library.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate(['title' => 'required|string|max:255', 'artist' => 'nullable|string|max:255',
            'file_url' => ['required', 'string', 'max:2048', new SafeMediaUrl], 'cover_image' => ['nullable', 'string', 'max:2048', new SafeMediaUrl],
            'category' => ['required', Rule::in(MusicTrack::CATEGORIES)], 'duration' => 'nullable|integer|min:0|max:7200',
            'is_active' => 'required|boolean', 'is_featured' => 'required|boolean']);
    }
}
