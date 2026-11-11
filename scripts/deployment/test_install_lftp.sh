#!/usr/bin/env bash
set -euo pipefail

test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

cat > "$test_dir/lftp" <<'MOCK'
#!/usr/bin/env bash
[ -f "$RADINA_FTP_TEST_DIR/ready" ] || exit 1
echo 'lftp test client'
MOCK

cat > "$test_dir/sudo" <<'MOCK'
#!/usr/bin/env bash
[ "$1" = 'apt-get' ] || exit 1
if [ "$2" = 'update' ]; then
  count=0
  [ ! -f "$RADINA_FTP_TEST_DIR/updates" ] || count="$(cat "$RADINA_FTP_TEST_DIR/updates")"
  count="$((count + 1))"
  printf '%s\n' "$count" > "$RADINA_FTP_TEST_DIR/updates"
  [ "$count" -gt 1 ]
elif [ "$2" = 'install' ]; then
  touch "$RADINA_FTP_TEST_DIR/ready"
else
  exit 1
fi
MOCK

cat > "$test_dir/sleep" <<'MOCK'
#!/usr/bin/env bash
exit 0
MOCK

chmod +x "$test_dir/lftp" "$test_dir/sudo" "$test_dir/sleep"
RADINA_FTP_TEST_DIR="$test_dir" PATH="$test_dir:$PATH" \
  bash scripts/deployment/install_lftp.sh > "$test_dir/output"

[ "$(cat "$test_dir/updates")" = '2' ]
[ -f "$test_dir/ready" ]
grep -q 'lftp siap digunakan' "$test_dir/output"
echo 'PASS: instalasi lftp mencoba ulang setelah kegagalan mirror sementara.'
