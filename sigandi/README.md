# SIGANDI 1.4.7 / Word 0.4.7

Versioned desktop, Word add-in, tests and guide generator for the public release
at `/sigandi`. This source directory is excluded from production web deployment.
The actual installer, PDF and SHA-256 release manifest are published under
`public/downloads/sigandi/` and included in the existing CI/CD upload.

## Release changes

- Update official support to +62 877 2417 0145 across desktop, Word and guide.

- Fill both sides of internal centered headings without touching their words.
- Horizontal leaders remain black in preview, color changes, PDF and print.
- Rail colors still apply to vertical lines and their caps.
- Preserve source text, document title, header/footer and signing exclusions.
- Retain mandatory server authorization introduced in 1.4.5 / 0.4.5.

## Local checks

On a Windows build workstation with Python and the dependencies in
`requirements-dev.txt`:

```powershell
python -m unittest discover -s tests -q
python word-addin/build_addin.py
python word-addin/check_center_headings.py
```

Native Word integration tests require Microsoft Word and an existing legitimate
activation. They use isolated documents, do not create licenses, and restore
user preferences. They are not intended for the Linux hosting server.

Build the executable using `GarisAktaEditor.spec`, generate the PDF with
`docs/generate_sigandi_guide.py`, then compile `GarisAktaEditor.iss` with Inno Setup.
The Word builder requires pyopenvba 6.5.0. The PDF generator uses Windows Segoe UI.
Provide the vendor's private release `.env` only on the build workstation;
activation keys, API tokens, signing secrets and cached activations must never
be committed here. Do not use a placeholder signing secret for a release.

After rebuilding, replace both downloads and regenerate their byte counts and
SHA-256 values in `public/downloads/sigandi/release.json`. The backend feature
test verifies every downloadable file against this manifest. Updating the
website alone does not upgrade copies already installed on customers' PCs.
