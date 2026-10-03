<?php

namespace App\Http\Requests;

use App\Rules\SafeMediaUrl;
use App\Services\TemplateCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->admin?->active;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:120', 'slug' => ['required', 'string', 'min:3', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('templates', 'slug')->ignore($this->route('template')?->id)],
            'description' => 'required|string|max:3000', 'category_id' => 'required|exists:template_categories,id', 'price' => 'required|integer|min:0|max:100000000',
            'component_name' => ['required', Rule::in(TemplateCatalog::COMPONENTS)], 'status' => ['required', Rule::in(['ACTIVE', 'DISABLED'])],
            'template_key' => ['required', Rule::in(TemplateCatalog::KEYS)],
            'is_featured' => 'required|boolean', 'thumbnail' => ['nullable', 'string', 'max:2048', new SafeMediaUrl], 'preview_image' => ['nullable', 'string', 'max:2048', new SafeMediaUrl],
            'features' => 'present|array|max:20', 'features.*' => 'string|max:120',
        ];
    }
}
