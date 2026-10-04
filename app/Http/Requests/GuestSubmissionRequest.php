<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuestSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = ['name' => 'required|string|min:2|max:120', 'message' => 'nullable|string|max:1000'];
        if (str_ends_with($this->path(), '/rsvp')) {
            $rules['guest_token'] = 'nullable|uuid';
            $rules['guests'] = 'required|integer|min:1|max:10';
            $rules['attendance'] = ['required', Rule::in(['Hadir', 'Tidak Hadir', 'Masih Ragu'])];
        } else {
            $rules['message'] = 'required|string|min:5|max:1000';
        }

        return $rules;
    }
}
