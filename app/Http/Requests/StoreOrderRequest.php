<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\InvitationEvent;

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
        $this->merge(['whatsapp' => $number, 'slug' => strtolower(trim((string) $this->slug)), 'event_type' => $this->input('event_type', 'wedding')]);
    }

    public function rules(): array
    {
        $wedding = $this->input('event_type', 'wedding') === 'wedding';
        return [
            'template_id' => ['required', 'integer', Rule::exists('templates', 'id')->where('status', 'ACTIVE')],
            'customer_name' => 'required|string|min:2|max:120', 'whatsapp' => 'required|regex:/^[1-9][0-9]{8,14}$/', 'email' => 'nullable|email|max:255',
            'event_type' => ['required', Rule::in(array_keys(InvitationEvent::types()))],
            'bride_name' => ($wedding ? 'required' : 'nullable').'|string|min:2|max:120', 'groom_name' => ($wedding ? 'required' : 'nullable').'|string|min:2|max:120',
            'event_title' => ($wedding ? 'nullable' : 'required').'|string|min:2|max:255',
            'host_name' => ($wedding ? 'nullable' : 'required').'|string|min:2|max:120',
            'honoree_name' => (! $wedding && InvitationEvent::profile(is_string($this->input('event_type')) ? $this->input('event_type') : null)['honoree'] ? 'required' : 'nullable').'|string|min:2|max:120',
            'slug' => ['required', 'string', 'min:3', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:orders,slug', 'unique:weddings,slug'],
        ];
    }
}
