<?php

namespace App\Http\Requests;

use App\Rules\SafeMediaUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveGiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->admin?->active;
    }

    public function giftData(): array
    {
        $data = $this->validated();
        $fields = match ($data['type']) {
            'BANK','EWALLET' => ['provider', 'account_number', 'account_name', 'logo'],
            'QRIS' => ['provider', 'account_name', 'qr_image'],
            'PHYSICAL' => ['recipient_name', 'phone', 'address'],
        };
        $empty = array_fill_keys(['provider', 'account_number', 'account_name', 'logo', 'qr_image', 'recipient_name', 'phone', 'address'], null);

        return array_replace($empty, collect($data)->only([...$fields, 'type', 'description', 'is_active', 'sort_order'])->all());
    }

    public function rules(): array
    {
        $type = $this->input('type');
        $number = in_array($type, ['BANK', 'EWALLET']);

        return ['type' => ['required', Rule::in(['BANK', 'EWALLET', 'QRIS', 'PHYSICAL'])],
            'provider' => [Rule::requiredIf($number || $type === 'QRIS'), 'nullable', 'string', 'max:120'],
            'account_number' => [Rule::requiredIf($number), 'nullable', 'string', 'max:60', 'regex:/^[0-9 +().-]+$/'],
            'account_name' => [Rule::requiredIf($number || $type === 'QRIS'), 'nullable', 'string', 'max:120'],
            'logo' => ['nullable', 'string', 'max:2048', new SafeMediaUrl],
            'qr_image' => [Rule::requiredIf($type === 'QRIS'), 'nullable', 'string', 'max:2048', new SafeMediaUrl],
            'recipient_name' => [Rule::requiredIf($type === 'PHYSICAL'), 'nullable', 'string', 'max:120'],
            'phone' => [Rule::requiredIf($type === 'PHYSICAL'), 'nullable', 'string', 'max:30'],
            'address' => [Rule::requiredIf($type === 'PHYSICAL'), 'nullable', 'string', 'max:2000'],
            'description' => 'nullable|string|max:2000', 'is_active' => 'required|boolean', 'sort_order' => 'sometimes|integer|min:0|max:1000'];
    }
}
