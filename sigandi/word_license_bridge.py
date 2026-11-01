"""Shared desktop/Word license entry points. Never return the key or API token."""
import os
from pathlib import Path
import tempfile


def license_context(api, args=None):
    ctx = object.__new__(api.GarisEditorApp)
    ctx.machine_id = api.get_machine_fingerprint()
    ctx.license_path = ctx._build_user_license_path()
    ctx.legacy_license_path = os.path.join(api.app_base_dir(), api.LICENSE_FILENAME)
    ctx.license_api_url = getattr(args, 'license_api_url', api.DEFAULT_LICENSE_API_URL)
    ctx.license_api_token = getattr(args, 'license_api_token', api.DEFAULT_LICENSE_API_TOKEN)
    ctx.license_api_timeout = getattr(args, 'license_api_timeout', api.DEFAULT_LICENSE_API_TIMEOUT)
    ctx.license_claims = None
    return ctx


def license_status(api, ctx):
    payload = None
    valid, message, claims = (False, 'Belum diaktivasi. Aktifkan lisensi SIGANDI pada komputer ini.', None)
    first_error = ''
    for source in ctx._candidate_license_paths():
        candidate = ctx._load_saved_license_payload_from_path(source)
        if not candidate:
            continue
        valid, candidate_message, claims = ctx.validate_saved_license_current(candidate)
        if valid:
            payload, message = candidate, candidate_message
            break
        if not first_error:
            first_error = candidate_message
    if not valid and first_error:
        message = first_error
    # Only show identity claims after successful verification.
    claims = (claims or {}) if valid else {}
    key = str((payload or {}).get('key', ''))
    return dict(Protocol='2', Valid='1' if valid else '0',
                Status='Aktif' if valid else 'Tidak aktif', Message=message,
                Customer=str(claims.get('customer', '')), Expires=str(claims.get('expires_at', '')),
                Device=ctx.machine_id, Serial=('*****-' + key[-5:]) if valid else '',
                Version=api.APP_VERSION)


def write_status(path, status):
    # Unicode text is readable by VBA FSO without JSON/parser dependencies.
    target = Path(path).resolve()
    if not target.parent.is_dir():
        raise ValueError('Folder hasil pemeriksaan lisensi tidak tersedia.')
    lines = ['[SIGANDI]']
    for key, value in status.items():
        value = str(value).replace('\r', ' ').replace('\n', ' ').replace('\x00', '')[:1000]
        lines.append(f'{key}={value}')
    fd, stage = tempfile.mkstemp(prefix='sigandi-license-', suffix='.tmp', dir=target.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-16') as stream:
            stream.write('\r\n'.join(lines) + '\r\n')
        os.replace(stage, target)
    finally:
        if os.path.exists(stage):
            os.unlink(stage)


def license_manager(api, ctx):
    tk, ttk = api.tk, api.ttk
    root = tk.Tk()
    ctx.root = root
    root.title('SIGANDI | Lisensi Desktop dan Word')
    root.geometry('570x390')
    root.configure(background='#f2f8f5')
    root.resizable(False, False)
    ttk.Style(root).configure('License.TButton', padding=(12, 8))
    title = tk.Frame(root, bg='#123f30', padx=24, pady=18)
    title.pack(fill='x')
    tk.Label(title, text='SIGANDI', bg='#123f30', fg='white', font=('Segoe UI', 21, 'bold')).pack(anchor='w')
    tk.Label(title, text='Satu aktivasi untuk desktop dan Word pada komputer ini',
             bg='#123f30', fg='#b9d8ca', font=('Segoe UI', 10)).pack(anchor='w')
    body = tk.Frame(root, bg='#f2f8f5', padx=24, pady=16)
    body.pack(fill='both', expand=True)
    text = tk.StringVar()
    ctx.set_status = lambda message: None

    def refresh():
        state = license_status(api, ctx)
        expiry = state['Expires'] or ('Tanpa batas waktu' if state['Valid'] == '1' else '-')
        text.set(f"Status: {state['Status']}\nPemilik: {state['Customer'] or '-'}\n"
                 f"Berlaku sampai: {expiry}\nPerangkat: {state['Device']}\n\n{state['Message']}")

    def activate():
        ctx.activate_license_dialog(required=False)
        refresh()

    tk.Label(body, textvariable=text, justify='left', anchor='nw', wraplength=510,
             bg='#f2f8f5', fg='#173d2e', font=('Segoe UI', 10)).pack(fill='both', expand=True)
    buttons = tk.Frame(body, bg='#f2f8f5')
    buttons.pack(fill='x')
    ttk.Button(buttons, text='Aktivasi / Ganti Key', style='License.TButton', command=activate).pack(side='left')
    ttk.Button(buttons, text='Periksa Ulang', style='License.TButton', command=refresh).pack(side='left', padx=8)
    ttk.Button(buttons, text='Tutup', style='License.TButton', command=root.destroy).pack(side='right')
    refresh()
    root.mainloop()


def run_bridge(api, args):
    ctx = license_context(api, args)
    if args.word_license_manager:
        license_manager(api, ctx)
        return 0
    if not args.word_license_output:
        raise ValueError('Pemeriksaan Word memerlukan lokasi hasil.')
    status = license_status(api, ctx)
    write_status(args.word_license_output, status)
    return 0 if status['Valid'] == '1' else 2
