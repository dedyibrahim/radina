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

    public function rsvps(Wedding $wedding)
    {
        return response()->json($wedding->rsvps()->paginate(30));
    }

    public function wishes(Wedding $wedding)
    {
        return response()->json($wedding->wishes()->paginate(30));
    }

    public function moderate(Request $request, Wedding $wedding, WeddingWish $wish)
    {
        abort_unless($wish->wedding_id === $wedding->id, 404);
        $data = $request->validate(['visible' => 'required|boolean']);
        $wish->update($data);

        return response()->json(['data' => $wish]);
    }
}
