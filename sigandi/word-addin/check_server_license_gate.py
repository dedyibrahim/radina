"""Real Word + packaged helper: a cached approval must not survive server denial.

Uses the existing legitimate activation for the positive check. The local HTTP
fixture only denies requests; it never issues a key or positive authorization.
No real license/cache/security settings or user documents are modified.
"""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import json
import shutil
import threading
import win32com.client

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp/sigandi-license-server-check'
STAGE = OUT / 'harness'
STAGE.mkdir(parents=True, exist_ok=True)
source = (ROOT / 'word-addin/SigandiWord.bas').read_text(encoding='utf-8')
source += '''
Public Function TestServerURL(ByVal value As String) As String
    Dim env As Object
    Set env = CreateObject("WScript.Shell").Environment("Process")
    TestServerURL = env("GARIS_LICENSE_API_URL")
    env("GARIS_LICENSE_API_URL") = value
End Function
Public Function TestExportGate() As String
    On Error GoTo Failed
    RequireLicense
    TestExportGate = "AUTHORIZED"
    Exit Function
Failed:
    TestExportGate = "DENIED: " & Err.Description
End Function
'''
(STAGE / 'SigandiWord.bas').write_text(source, encoding='utf-8')
shutil.copy2(ROOT / 'word-addin/customUI.xml', STAGE / 'customUI.xml')
spec = importlib.util.spec_from_file_location('builder', ROOT / 'word-addin/build_addin.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
builder.HERE = STAGE
builder.OUT = STAGE
builder.build(STAGE / 'license-gate-test.dotm')


class DenyServer(BaseHTTPRequestHandler):
    code = 404
    requests = 0

    def do_POST(self):
        type(self).requests += 1
        self.rfile.read(int(self.headers.get('Content-Length', '0')))
        data = json.dumps({'valid': False, 'message': 'TEST: license deleted or revoked'}).encode()
        self.send_response(type(self).code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), DenyServer)
worker = threading.Thread(target=server.serve_forever, daemon=True)
worker.start()
app = doc = None
report = {}
old_url = None
try:
    app = win32com.client.DispatchEx('Word.Application')
    app.Visible = False
    app.DisplayAlerts = 0
    for addin in app.AddIns:
        if 'sigandi' in addin.Name.lower() and addin.Installed:
            addin.Installed = False
    app.AddIns.Add(str(STAGE / 'license-gate-test.dotm'), True)
    doc = app.Documents.Add()
    doc.Content.Text = 'Isi akta untuk pengujian penolakan lisensi.\r' * 4
    doc.Bookmarks.Add('SIGANDI_AREA_ISI', doc.Content)
    original = doc.Content.Text
    # Real existing license, real production server; no fabricated approval.
    status = app.Run('Module1.SigandiLicenseStatus', True)
    report['real_server_status'] = status
    assert app.Run('Module1.TestExportGate') == 'AUTHORIZED', status
    report['real_server_approved'] = True
    url = f'http://127.0.0.1:{server.server_port}/api/license/activate'
    old_url = app.Run('Module1.TestServerURL', url)
    for code in (404, 403, 500):
        DenyServer.code = code
        count = DenyServer.requests
        before_shapes = doc.Shapes.Count
        value = app.Run('Module1.SigandiTryBuild', True, True)
        assert value.startswith('ERROR:') and 'TEST:' in value, value
        assert DenyServer.requests > count, 'Stale Word approval bypassed server'
        assert doc.Content.Text == original and doc.Shapes.Count == before_shapes
        report[str(code)] = dict(denied=True, contacted_server=True, text_and_shapes_unchanged=True)
        print(code, 'denied before drawing', flush=True)
    app.Run('Module1.TestServerURL', 'http://127.0.0.1:1/api/license/activate')
    value = app.Run('Module1.SigandiTryBuild', True, True)
    assert value.startswith('ERROR:') and 'Gagal terhubung' in value, value
    report['offline_denied'] = True
    report['status'] = 'PASS'
finally:
    if app is not None and old_url is not None:
        app.Run('Module1.TestServerURL', old_url)
    if doc is not None:
        doc.Close(False)
    if app is not None:
        app.Quit(False)
    server.shutdown()
    server.server_close()
    (OUT / 'word-gate-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
