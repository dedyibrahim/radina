import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from prune_unchanged_release import prune


class ReleasePruningTest(unittest.TestCase):
    def test_skip_identical_files_but_keep_changed_new_files_and_safety_hook(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "upload"
            root.mkdir()
            source = Path(directory) / "source"
            source.write_text("unchanged")
            contents = {"image.jpg": b"unchanged", "changed.php": b"new", "added.php": b"new", "deploy-hook.php": b"unchanged", ".radina-release-manifest.json": b"new-manifest"}
            for name, value in contents.items():
                (root / name).write_bytes(value)
            files = {name: {"bytes": len(b"unchanged"), "sha256": hashlib.sha256(b"unchanged").hexdigest()} for name in ("image.jpg", "changed.php", "deploy-hook.php")}
            previous = Path(directory) / "previous.json"
            previous.write_text(json.dumps({"commit": "old", "files": files}))
            self.assertEqual(prune(root, previous, "old"), 1)
            self.assertFalse((root / "image.jpg").exists())
            self.assertTrue(all((root / name).exists() for name in contents if name != "image.jpg"))
            self.assertEqual(source.read_text(), "unchanged")

    def test_missing_invalid_or_unconfirmed_manifest_keeps_every_file(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "upload"
            root.mkdir()
            (root / "file.php").write_bytes(b"same")
            previous = Path(directory) / "previous.json"
            for value in (None, "invalid", "[]", json.dumps({"commit": "unconfirmed", "files": {}})):
                if value is not None:
                    previous.write_text(value)
                self.assertEqual(prune(root, previous, "verified"), 0)
                self.assertTrue((root / "file.php").exists())


if __name__ == "__main__":
    unittest.main()
