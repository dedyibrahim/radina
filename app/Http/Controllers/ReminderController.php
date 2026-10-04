<?php

namespace App\Http\Controllers;

use App\Models\OrderReminder;
use App\Services\OrderReminderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReminderController extends Controller
{
    public function index(Request $request, OrderReminderService $reminders)
    {
        $data = $request->validate(['scope' => ['sometimes', Rule::in(['due', 'scheduled', 'all'])]]);
        $reminders->refresh();
        $active = $reminders->active();
        $due = (clone $active)->where('due_at', '<=', now())->where(fn ($q) => $q->whereNull('snoozed_until')->orWhere('snoozed_until', '<=', now()));
        $query = match ($data['scope'] ?? 'due') {
            'due' => clone $due,
            'scheduled' => (clone $active)->where(fn ($q) => $q->where('due_at', '>', now())->orWhere('snoozed_until', '>', now())),
            default => $active,
        };

        return response()->json(['due_count' => (clone $due)->count(), 'reminders' => $query->with('order:id,order_number,customer_name,slug')->orderBy('due_at')->paginate(30)])->header('Cache-Control', 'private, no-store');
    }

    public function update(Request $request, OrderReminder $reminder)
    {
        $data = $request->validate(['action' => ['required', Rule::in(['dismiss', 'snooze', 'restore'])]]);
        $reminder->update(match ($data['action']) {
            'dismiss' => ['dismissed_at' => now()], 'snooze' => ['snoozed_until' => now()->addDay()], default => ['dismissed_at' => null, 'snoozed_until' => null],
        });

        return response()->json(['data' => $reminder]);
    }
}
