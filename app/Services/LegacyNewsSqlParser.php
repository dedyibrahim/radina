<?php

namespace App\Services;

use RuntimeException;

class LegacyNewsSqlParser
{
    public function table(string $sql, string $table): array
    {
        $rows = [];
        $needle = "INSERT INTO `{$table}`";
        $offset = 0;

        while (($position = strpos($sql, $needle, $offset)) !== false) {
            $columnsStart = strpos($sql, '(', $position);
            $valuesMarker = strpos($sql, ') VALUES', $columnsStart);

            if ($columnsStart === false || $valuesMarker === false) {
                throw new RuntimeException("Format INSERT tabel {$table} tidak dikenali.");
            }

            $columns = array_map(
                fn (string $column) => trim($column, " \t\n\r\0\x0B`"),
                explode(',', substr($sql, $columnsStart + 1, $valuesMarker - $columnsStart - 1))
            );

            $valuesStart = $valuesMarker + strlen(') VALUES');
            [$values, $statementEnd] = $this->extractValues($sql, $valuesStart);

            foreach ($this->parseRows($values) as $valuesRow) {
                if (count($columns) !== count($valuesRow)) {
                    throw new RuntimeException("Jumlah kolom tabel {$table} tidak sesuai dengan jumlah nilai.");
                }

                $rows[] = array_combine($columns, $valuesRow);
            }

            $offset = $statementEnd + 1;
        }

        return $rows;
    }

    private function extractValues(string $sql, int $start): array
    {
        $inQuote = false;
        $escaped = false;
        $length = strlen($sql);

        for ($index = $start; $index < $length; $index++) {
            $character = $sql[$index];

            if ($inQuote) {
                if ($escaped) {
                    $escaped = false;
                    continue;
                }

                if ($character === '\\') {
                    $escaped = true;
                    continue;
                }

                if ($character === "'") {
                    if (($sql[$index + 1] ?? null) === "'") {
                        $index++;
                        continue;
                    }

                    $inQuote = false;
                }

                continue;
            }

            if ($character === "'") {
                $inQuote = true;
                continue;
            }

            if ($character === ';') {
                return [substr($sql, $start, $index - $start), $index];
            }
        }

        throw new RuntimeException('Akhir statement INSERT tidak ditemukan.');
    }

    private function parseRows(string $values): array
    {
        $rows = [];
        $row = [];
        $value = '';
        $depth = 0;
        $inQuote = false;
        $quoted = false;
        $length = strlen($values);

        for ($index = 0; $index < $length; $index++) {
            $character = $values[$index];

            if ($inQuote) {
                if ($character === '\\') {
                    $index++;
                    $value .= $this->decodeEscape($values[$index] ?? '');
                    continue;
                }

                if ($character === "'") {
                    if (($values[$index + 1] ?? null) === "'") {
                        $value .= "'";
                        $index++;
                        continue;
                    }

                    $inQuote = false;
                    continue;
                }

                $value .= $character;
                continue;
            }

            if ($character === "'" && $depth === 1) {
                $inQuote = true;
                $quoted = true;
                continue;
            }

            if ($character === '(' && $depth === 0) {
                $depth = 1;
                $row = [];
                $value = '';
                $quoted = false;
                continue;
            }

            if ($character === ',' && $depth === 1) {
                $row[] = $this->normalizeValue($value, $quoted);
                $value = '';
                $quoted = false;
                continue;
            }

            if ($character === ')' && $depth === 1) {
                $row[] = $this->normalizeValue($value, $quoted);
                $rows[] = $row;
                $depth = 0;
                $value = '';
                $quoted = false;
                continue;
            }

            if ($depth === 1) {
                $value .= $character;
            }
        }

        return $rows;
    }

    private function normalizeValue(string $value, bool $quoted): mixed
    {
        if ($quoted) {
            return trim($value);
        }

        $value = trim($value);

        if (strcasecmp($value, 'NULL') === 0) {
            return null;
        }

        if (is_numeric($value)) {
            return str_contains($value, '.') ? (float) $value : (int) $value;
        }

        return $value;
    }

    private function decodeEscape(string $character): string
    {
        return match ($character) {
            '0' => "\0",
            'n' => "\n",
            'r' => "\r",
            't' => "\t",
            'Z' => chr(26),
            default => $character,
        };
    }
}
