<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Reader\IReadFilter;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
use ZipArchive;

class GuestSpreadsheet
{
    public static function read(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension === 'csv') {
            return ImportCsv::read($file, ['nama']);
        }
        if ($extension !== 'xlsx') {
            ImportCsv::fail('Gunakan file Excel .xlsx atau CSV UTF-8.');
        }

        $zip = new ZipArchive;
        if ($zip->open($file->getRealPath()) !== true) {
            ImportCsv::fail('File Excel tidak valid. Unduh dan gunakan template tamu.');
        }
        try {
            $size = 0;
            if ($zip->numFiles > 2000) {
                ImportCsv::fail('File Excel terlalu kompleks. Gunakan template tamu.');
            }
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $size += $zip->statIndex($i)['size'];
                if ($size > 16 * 1024 * 1024) {
                    ImportCsv::fail('Isi file Excel terlalu besar. Maksimal 1.000 tamu per file.');
                }
            }
        } finally {
            $zip->close();
        }
        $book = null;
        try {
            $reader = new Xlsx;
            $info = $reader->listWorksheetInfo($file->getRealPath());
            if (count($info) !== 1 || $info[0]['totalRows'] > 1001 || $info[0]['totalColumns'] > 20) {
                ImportCsv::fail('Gunakan satu lembar Excel, maksimal 1.000 baris tamu dan 20 kolom.');
            }
            $reader->setReadDataOnly(true);
            $reader->setReadFilter(new class implements IReadFilter
            {
                public function readCell(string $columnAddress, int $row, string $worksheetName = ''): bool
                {
                    return $row <= 1001 && Coordinate::columnIndexFromString($columnAddress) <= 20;
                }
            });
            $book = $reader->load($file->getRealPath());
            $sheet = $book->getSheet(0);
            $columns = [];
            $rows = [];
            for ($r = 1; $r <= $info[0]['totalRows']; $r++) {
                $values = [];
                for ($c = 1; $c <= $info[0]['totalColumns']; $c++) {
                    $cell = $sheet->getCell([$c, $r]);
                    if ($cell->getDataType() === DataType::TYPE_FORMULA) {
                        ImportCsv::fail("Baris $r: gunakan teks, bukan rumus Excel.");
                    }
                    $values[] = trim((string) ($cell->getValue() ?? ''));
                }
                if ($r === 1) {
                    $columns = array_map(fn ($v) => mb_strtolower($v), $values);
                    if (! in_array('nama', $columns) || in_array('', $columns) || count(array_unique($columns)) !== count($columns)) {
                        ImportCsv::fail('Kolom nama wajib ada; nama kolom tidak boleh kosong atau berulang.');
                    }

                    continue;
                }
                if (! array_filter($values, fn ($v) => $v !== '')) {
                    continue;
                }
                $rows[] = array_combine($columns, $values) + ['_row' => $r];
            }
            if (! $rows) {
                ImportCsv::fail('File belum memiliki data untuk diimpor.');
            }

            return $rows;
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            ImportCsv::fail('File Excel tidak dapat dibaca. Gunakan template tamu yang diunduh.');
        } finally {
            $book?->disconnectWorksheets();
        }
    }

    public static function download(string $filename, array $headers, iterable $rows, bool $excel)
    {
        if (! $excel) {
            return ImportCsv::download($filename.'.csv', $headers, $rows);
        }

        return response()->streamDownload(function () use ($headers, $rows) {
            $book = new Spreadsheet;
            try {
                $sheet = $book->getActiveSheet();
                $sheet->setTitle('Tamu Undangan');
                $rowIndex = 1;
                foreach ($headers as $c => $value) {
                    $sheet->setCellValueExplicit([$c + 1, 1], (string) $value, DataType::TYPE_STRING);
                }
                foreach ($rows as $row) {
                    $rowIndex++;
                    foreach ($row as $c => $value) {
                        $sheet->setCellValueExplicit([$c + 1, $rowIndex], (string) ($value ?? ''), DataType::TYPE_STRING);
                    }
                }
                $last = Coordinate::stringFromColumnIndex(count($headers));
                // Excel must keep leading zeroes when a customer types a new phone number.
                $sheet->getStyle('A:'.$last)->getNumberFormat()->setFormatCode('@');
                $sheet->getStyle('A1:'.$last.'1')->getFont()->setBold(true);
                $sheet->freezePane('A2');
                $sheet->setAutoFilter('A1:'.$last.$rowIndex);
                foreach ($headers as $c => $header) {
                    $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($c + 1))->setWidth($header === 'pesan_undangan' ? 80 : 28);
                }
                (new XlsxWriter($book))->save('php://output');
            } finally {
                $book->disconnectWorksheets();
            }
        }, $filename.'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
