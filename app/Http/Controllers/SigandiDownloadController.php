<?php

namespace App\Http\Controllers;

class SigandiDownloadController extends Controller
{
    private function manifest(): array
    {
        $path = public_path('downloads/sigandi/release.json');
        abort_unless(is_file($path), 503, 'Paket SIGANDI sedang disiapkan.');
        $data = json_decode(file_get_contents($path), true);
        abort_unless(is_array($data) && isset($data['version'], $data['files']), 503);

        return $data;
    }

    public function release()
    {
        return response()->json($this->manifest())->header('Cache-Control', 'no-store');
    }

    public function download(string $type)
    {
        abort_unless(in_array($type, ['installer', 'guide'], true), 404);
        $file = $this->manifest()['files'][$type] ?? null;
        $pattern = $type === 'installer'
            ? '/^GarisAktaEditor_Setup_v[0-9]+\.[0-9]+\.[0-9]+\.exe$/D'
            : '/^Panduan_SIGANDI_v[0-9]+\.[0-9]+\.[0-9]+\.pdf$/D';
        abort_unless(is_array($file) && preg_match($pattern, $file['filename'] ?? ''), 404);
        $path = public_path('downloads/sigandi/'.$file['filename']);
        abort_unless(is_file($path), 404, 'Berkas unduhan belum tersedia.');

        return response()->download($path, $file['filename'], [
            'Content-Type' => $type === 'guide' ? 'application/pdf' : 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'X-Robots-Tag' => 'noindex',
            'Cache-Control' => 'public, max-age=0, must-revalidate',
        ]);
    }
}
