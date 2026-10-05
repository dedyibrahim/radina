<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveWeddingRequest;
use App\Http\Resources\WeddingResource;
use App\Models\Wedding;
use App\Models\WeddingWish;
use App\Services\WeddingService;
use Illuminate\Http\Request;

class AdminWeddingController extends Controller
{
    public function show(Wedding $wedding, WeddingService $service)
    {
        $service->ensurePaid($wedding->order);

        return new WeddingResource($wedding->loadContent());
    }

    public function update(SaveWeddingRequest $request, Wedding $wedding, WeddingService $service)
    {
        return new WeddingResource($service->save($wedding, $request->validated(), $request->user()->id));
    }

    public function publish(Request $request, Wedding $wedding, WeddingService $service)
    {
        return new WeddingResource($service->publish($wedding, $request->user()->id));
    }

    public function rsvps(Request $request, Wedding $wedding)
    {
        return $this->guestResponses($request, $wedding, 'rsvps', ['id', 'name', 'guests', 'attendance', 'message', 'created_at']);
    }

    public function wishes(Request $request, Wedding $wedding)
    {
        return $this->guestResponses($request, $wedding, 'wishes', ['id', 'name', 'message', 'visible', 'created_at']);
    }

    private function guestResponses(Request $request, Wedding $wedding, string $relation, array $fields)
    {
        $data = $request->validate(['search' => 'sometimes|nullable|string|max:120', 'page' => 'sometimes|integer|min:1']);
        $query = $wedding->{$relation}()->select($fields)->orderByDesc('id');
        $search = trim($data['search'] ?? '');
        if ($search !== '') {
            $query->where('name', 'like', '%'.addcslashes($search, '%_\\').'%');
        }

        return response()->json($query->paginate(30));
    }

    public function moderate(Request $request, Wedding $wedding, WeddingWish $wish)
    {
        abort_unless($wish->wedding_id === $wedding->id, 404);
        $data = $request->validate(['visible' => 'required|boolean']);
        $wish->update($data);

        return response()->json(['data' => $wish]);
    }
}
