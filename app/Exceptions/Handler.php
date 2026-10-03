<?php
namespace App\Exceptions;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
class Handler extends ExceptionHandler
{
    protected $dontFlash = ['current_password', 'password', 'password_confirmation'];
    public function register(): void
    {
        $this->renderable(function (QueryException $exception, Request $request) {
            if ($request->expectsJson() && ($exception->errorInfo[1] ?? null) === 1062) {
                return response()->json(['message' => 'Data sudah digunakan.', 'errors' => ['slug' => ['Slug sudah digunakan. Pilih nama lain.']]], 422);
            }
        });
    }
}
