"""Skip staging files identical to the last verified production manifest.

The new signed manifest still includes every expected file. The deployment hook
verifies them all on the server before any database migration can run.
"""
import hashlib
import json
from pathlib import Path
import sys

ALWAYS_UPLOAD = {".radina-release-manifest.json", ".radina-release-commit", "deploy-hook.php", "index.php", ".htaccess", "_app/.htaccess"}


def prune(root, previous, base_commit):
    root = Path(root).resolve()
    try:
        old = json.loads(Path(previous).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return 0
    if not isinstance(old, dict) or old.get("commit") != base_commit or not isinstance(old.get("files"), dict):
        return 0
    skipped = 0
    for path in root.rglob("*"):
        if not path.is_file() or path.is_symlink():
            continue
        relative = path.relative_to(root).as_posix()
        if relative in ALWAYS_UPLOAD:
            continue
        before = old["files"].get(relative)
        if not isinstance(before, dict):
            continue
        if path.stat().st_size == before.get("bytes") and hashlib.sha256(path.read_bytes()).hexdigest() == before.get("sha256"):
            # Delete only this temporary upload copy, never source or remote files.
            path.resolve().relative_to(root)
            path.unlink()
            skipped += 1
    return skipped


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Provide the staging directory, previous manifest, and last production commit.")
    print(f"Unchanged verified production files skipped: {prune(*sys.argv[1:])}")
