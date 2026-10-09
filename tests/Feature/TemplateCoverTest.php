<?php

namespace Tests\Feature;

use App\Http\Resources\TemplateResource;
use App\Models\Template;
use Tests\TestCase;

class TemplateCoverTest extends TestCase
{
    public function test_catalog_cover_uses_real_preview_without_modifying_saved_data(): void
    {
        $template = new Template([
            'template_key' => 'minimalist-white',
            'thumbnail' => '/images/templates/minimalist-white.svg',
            'preview_image' => '/images/templates/minimalist-white.svg',
            'price' => 98765,
        ]);
        $template->setRelation('category', null);
        $snapshot = $template->getAttributes();
        $data = (new TemplateResource($template))->resolve();
        $this->assertSame('/images/templates/previews/minimalist-white.webp', $data['thumbnail']);
        $this->assertSame($data['thumbnail'], $data['preview_image']);
        $this->assertSame($snapshot, $template->getAttributes());
    }

    public function test_custom_images_and_cinematic_covers_are_preserved(): void
    {
        foreach ([
            ['rosalia-arch', '/storage/templates/custom-cover.webp'],
            ['anak-unicorn-cinematic', '/images/cinematic/kids/preview-unicorn.webp'],
            ['javanese-royal-garden', '/images/cinematic/jawa-pendopo-640.webp'],
        ] as [$key, $image]) {
            $template = new Template(['template_key' => $key, 'thumbnail' => $image, 'preview_image' => $image]);
            $template->setRelation('category', null);
            $data = (new TemplateResource($template))->resolve();
            $this->assertSame($image, $data['thumbnail']);
            $this->assertSame($image, $data['preview_image']);
        }
    }

    public function test_unknown_catalog_asset_keeps_saved_thumbnail(): void
    {
        $template = new Template(['template_key' => 'custom-template', 'thumbnail' => '/images/templates/custom-template.svg']);
        $template->setRelation('category', null);
        $this->assertSame($template->thumbnail, (new TemplateResource($template))->resolve()['thumbnail']);
    }
}
