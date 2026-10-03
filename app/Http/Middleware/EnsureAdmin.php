<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user()?->isAdmin() && $request->user()?->admin?->active, 403, 'Akses hanya untuk administrator aktif.');

        return $next($request);
    }
}
