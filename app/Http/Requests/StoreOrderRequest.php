<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $number = preg_replace('/[^0-9]/', '', (string) $this->whatsapp);
        if (str_starts_with($number, '0')) {
            $number = '62'.substr($number, 1);
        }
        $this->merge(['whatsapp' => $number, 'slug' => strtolower(trim((string) $this->slug))]);
    }

    public function rules(): array
    {
        return [
            'template_id' => ['required', 'integer', Rule::exists('templates', 'id')->where('status', 'ACTIVE')],
            'customer_name' => 'required|string|min:2|max:120', 'whatsapp' => 'required|regex:/^[1-9][0-9]{8,14}$/', 'email' => 'nullable|email|max:255',
            'bride_name' => 'required|string|min:2|max:120', 'groom_name' => 'required|string|min:2|max:120',
            'slug' => ['required', 'string', 'min:3', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:orders,slug', 'unique:weddings,slug'],
        ];
    }
}
