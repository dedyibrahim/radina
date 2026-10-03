<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveTemplateRequest;
use App\Http\Resources\TemplateResource;
use App\Models\Template;

class AdminTemplateController extends Controller
{
    public function index()
    {
        return TemplateResource::collection(Template::with('category')->latest()->get());
    }

    public function store(SaveTemplateRequest $request)
    {
        return new TemplateResource(Template::create($request->validated())->load('category'));
    }

    public function update(SaveTemplateRequest $request, Template $template)
    {
        $template->update($request->validated());

        return new TemplateResource($template->load('category'));
    }
}
