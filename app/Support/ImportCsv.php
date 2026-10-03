<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class ImportCsv
{
    public static function read(UploadedFile $file, array $headers, int $limit = 1000): array
    {
        $text = file_get_contents($file->getRealPath());
        if (str_starts_with($text, "\xFF\xFE")) {
            $text = mb_convert_encoding(substr($text, 2), 'UTF-8', 'UTF-16LE');
        } elseif (str_starts_with($text, "\xFE\xFF")) {
            $text = mb_convert_encoding(substr($text, 2), 'UTF-8', 'UTF-16BE');
        }
        $text = preg_replace('/^\xEF\xBB\xBF/', '', $text);
        if (! mb_check_encoding($text, 'UTF-8') || str_contains($text, "\0")) {
            self::fail('Gunakan file CSV UTF-8 dari Excel atau Google Sheets.');
        }
        $text = preg_replace('/^sep=[;,\t]\r?\n/i', '', $text);
        $delimiter = null;
        foreach ([';', ',', "\t"] as $candidate) {
            $first = str_getcsv(strtok($text, "\r\n") ?: '', $candidate, '"', '');
            $first = array_map(fn ($v) => mb_strtolower(trim((string) $v)), $first);
            if (count(array_intersect($headers, $first)) === count($headers)) {
                $delimiter = $candidate;
                break;
            }
        }
        if ($delimiter === null) {
            self::fail('Kolom wajib: '.implode(', ', $headers).'. Gunakan template yang diunduh.');
        }
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $text);
        rewind($stream);
        try {
            $columns = array_map(fn ($v) => mb_strtolower(trim((string) $v)), fgetcsv($stream, 0, $delimiter, '"', ''));
            if (count(array_unique($columns)) !== count($columns)) {
                self::fail('Nama kolom tidak boleh berulang.');
            }
            $rows = [];
            $line = 1;
            while (($values = fgetcsv($stream, 0, $delimiter, '"', '')) !== false) {
                $line++;
                if (! array_filter($values, fn ($v) => trim((string) $v) !== '')) {
                    continue;
                }
                if (count($values) !== count($columns)) {
                    self::fail("Baris $line: jumlah kolom tidak sesuai header.");
                }
                if (count($rows) >= $limit) {
                    self::fail("Maksimal $limit baris dalam satu file.");
                }
                $row = array_combine($columns, array_map(fn ($v) => trim((string) $v), $values));
                $row['_row'] = $line;
                $rows[] = $row;
            }
            if (! $rows) {
                self::fail('File belum memiliki data untuk diimpor.');
            }

            return $rows;
        } finally {
            fclose($stream);
        }
    }

    public static function download(string $filename, array $headers, iterable $rows)
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers, ';', '"', '', "\r\n");
            foreach ($rows as $row) {
                // Spreadsheet applications must treat user values as text, never formulas.
                $safe = array_map(fn ($v) => preg_match('/^(?:[\s\x00-\x1F]*[=+@-]|0[0-9]+$)/u', (string) $v) ? "'".$v : (string) ($v ?? ''), $row);
                fputcsv($out, $safe, ';', '"', '', "\r\n");
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }

    public static function fail(string $message): never
    {
        throw ValidationException::withMessages(['file' => $message]);
    }

    public static function text(string $value): string
    {
        return preg_match("/^'(?:[\\s\\x00-\\x1F]*[=+@-]|0[0-9]+$)/u", $value) ? substr($value, 1) : $value;
    }
}
