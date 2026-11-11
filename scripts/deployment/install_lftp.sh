#!/usr/bin/env bash
set -euo pipefail

if command -v lftp >/dev/null 2>&1 && lftp --version >/dev/null 2>&1; then
  echo "lftp sudah tersedia pada runner."
  exit 0
fi

for attempt in 1 2 3 4; do
  echo "Menyiapkan lftp (percobaan ${attempt}/4)."
  if sudo apt-get update -qq \
      -o Acquire::Retries=2 \
      -o Acquire::http::Timeout=20 \
      -o Acquire::https::Timeout=20 \
    && sudo apt-get install -y -qq --no-install-recommends lftp \
      -o Acquire::Retries=2 \
      -o Acquire::http::Timeout=20 \
      -o Acquire::https::Timeout=20; then
    if command -v lftp >/dev/null 2>&1 && lftp --version >/dev/null 2>&1; then
      echo "lftp siap digunakan."
      exit 0
    fi
  fi

  if [ "$attempt" -eq 2 ]; then
    # GitHub's Ubuntu runner sometimes points at the Azure mirror. Retry the
    # official Ubuntu archive if that mirror cannot be resolved.
    for source in /etc/apt/sources.list /etc/apt/sources.list.d/ubuntu.sources; do
      if [ -f "$source" ]; then
        sudo sed -i 's/azure\.archive\.ubuntu\.com/archive.ubuntu.com/g' "$source"
      fi
    done
  fi

  if [ "$attempt" -lt 4 ]; then
    sleep "$((attempt * 10))"
  fi
done

echo "::error::lftp tidak dapat dipasang karena mirror Ubuntu tidak terjangkau. Coba jalankan ulang job Deploy production ketika jaringan runner pulih."
exit 1
