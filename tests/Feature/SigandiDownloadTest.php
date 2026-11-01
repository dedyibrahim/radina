<?php

namespace Tests\Feature;

use Tests\TestCase;

class SigandiDownloadTest extends TestCase
{
    public function test_sigandi_is_a_public_indexable_page_with_its_own_metadata(): void
    {
        $this->get('/sigandi')->assertOk()
            ->assertSee('SIGANDI - Rapikan Garis Akta', false)
            ->assertSee('/images/sigandi/sigandi-preview.svg', false)
            ->assertDontSee('<meta name="robots" content="noindex,nofollow"', false);
    }

    public function test_release_manifest_and_downloads_reference_the_same_real_files(): void
    {
        $data = $this->getJson('/sigandi/release')->assertOk()->json();
        $this->assertSame('1.4.6', $data['version']);
        $this->assertSame('0.4.6', $data['word_version']);
        foreach (['installer', 'guide'] as $type) {
            $file = $data['files'][$type];
            $path = public_path('downloads/sigandi/'.$file['filename']);
            $this->assertFileExists($path);
            $this->assertSame(filesize($path), $file['bytes']);
            $this->assertSame(hash_file('sha256', $path), $file['sha256']);
            $this->get('/sigandi/download/'.$type)->assertOk()
                ->assertDownload($file['filename'])
                ->assertHeader('X-Content-Type-Options', 'nosniff');
        }
        $this->assertStringEndsWith('.exe', $data['files']['installer']['filename']);
        $this->assertStringEndsWith('.pdf', $data['files']['guide']['filename']);
    }

    public function test_download_route_is_an_allowlist_and_never_serves_arbitrary_files(): void
    {
        foreach (['env', 'license', 'unknown', 'release.json', '..%2F.env'] as $type) {
            $this->get('/sigandi/download/'.$type)->assertNotFound();
        }
    }
}
