import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import garis_editor as app
from word_license_bridge import license_status, write_status


class WordLicenseTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.secret = patch.object(app, 'LICENSE_SECRET', 'isolated-unit-test-secret')
        self.secret.start()
        self.addCleanup(self.secret.stop)
        self.ctx = object.__new__(app.GarisEditorApp)
        self.ctx.machine_id = 'unit-test-device'
        self.ctx.license_path = str(Path(self.tmp.name)/'license.json')
        self.ctx.legacy_license_path = str(Path(self.tmp.name)/'missing.json')
        self.ctx.license_api_url = 'https://license.invalid/api/license/activate'
        self.ctx.license_api_token = ''
        self.ctx.license_api_timeout = 1
        self.claims = dict(product=app.LICENSE_PRODUCT, customer='UNIT TEST', status='active',
                           machine_id=self.ctx.machine_id, serial='TEST-ONLY-NOT-A-LICENSE',
                           expires_at='2099-12-31', format='online')
        self.server = patch.object(app, 'post_json', return_value=(200, {
            'valid': True, 'license': dict(product_name=app.LICENSE_PRODUCT,
                customer_name='UNIT TEST', status='active', expires_at='2099-12-31',
                key=self.claims['serial'], active_devices=1, max_activations=1)}))
        self.post = self.server.start()
        self.addCleanup(self.server.stop)

    def payload(self, **changes):
        claims = dict(self.claims, **changes)
        return dict(key=self.claims['serial'], machine_id=self.ctx.machine_id, claims=claims,
                    signature=self.ctx._build_saved_license_signature(self.claims['serial'], claims, self.ctx.machine_id))

    def store(self, payload):
        Path(self.ctx.license_path).write_text(json.dumps(payload))

    def test_shared_valid_cache_and_redacted_output(self):
        self.store(self.payload())
        state = license_status(app, self.ctx)
        self.assertEqual(state['Valid'], '1')
        self.assertEqual(state['Customer'], 'UNIT TEST')
        self.assertNotIn(self.claims['serial'], json.dumps(state))
        path = Path(self.tmp.name)/'response.ini'
        write_status(path, state)
        self.assertIn('Valid=1', path.read_text(encoding='utf-16'))

    def test_missing_cache(self):
        self.assertEqual(license_status(app, self.ctx)['Valid'], '0')

    def test_deleted_license_rejects_signed_cache_and_legacy(self):
        self.store(self.payload())
        Path(self.ctx.legacy_license_path).write_text(json.dumps(self.payload()))
        self.post.return_value = (404, {'valid': False, 'message': 'License tidak ditemukan.'})
        state = license_status(app, self.ctx)
        self.assertEqual(state['Valid'], '0')
        self.assertEqual(state['Customer'], '')
        self.assertIn('tidak ditemukan', state['Message'])

    def test_server_revoked_expired_and_invalid_responses(self):
        self.store(self.payload())
        for response in [(403, {'valid': False}), (200, {'valid': False}),
                         (401, {}), (500, {}), (200, 'invalid-json'),
                         (200, {'valid': 'false'}), (200, {'valid': True})]:
            with self.subTest(response=response):
                self.post.return_value = response
                self.assertEqual(license_status(app, self.ctx)['Valid'], '0')

    def test_network_failure_cannot_fall_back_to_signed_cache(self):
        self.store(self.payload())
        self.post.side_effect = TimeoutError('server unavailable')
        self.assertEqual(license_status(app, self.ctx)['Valid'], '0')

    def test_every_check_recontacts_server_and_sees_deletion(self):
        self.store(self.payload())
        self.assertEqual(license_status(app, self.ctx)['Valid'], '1')
        self.post.return_value = (404, {'valid': False})
        self.assertEqual(license_status(app, self.ctx)['Valid'], '0')
        self.assertEqual(self.post.call_count, 2)

    def test_blank_server_url_does_not_enable_offline_mode(self):
        self.store(self.payload())
        self.ctx.license_api_url = ''
        self.assertEqual(license_status(app, self.ctx)['Valid'], '0')
        self.post.assert_not_called()

    def test_desktop_action_rechecks_and_clears_previous_claims(self):
        self.store(self.payload())
        self.ctx.license_claims = dict(self.claims)
        self.post.return_value = (404, {'valid': False})
        with patch.object(app.messagebox, 'showwarning'):
            self.assertFalse(self.ctx.require_current_license())
        self.assertIsNone(self.ctx.license_claims)

    def test_desktop_startup_does_not_accept_deleted_cached_license(self):
        self.store(self.payload())
        self.post.return_value = (404, {'valid': False})
        with patch.object(app.messagebox, 'showwarning'), patch.object(app.messagebox, 'showinfo'), \
             patch.object(self.ctx, 'activate_license_dialog', return_value=False), \
             patch.object(self.ctx, 'save_license') as save:
            self.assertFalse(self.ctx.ensure_license())
            save.assert_not_called()

    def test_server_active_claims_still_require_correct_product_and_expiry(self):
        self.store(self.payload())
        original = self.post.return_value[1]
        for change in [dict(expires_at='2000-01-01'), dict(status='revoked'),
                       dict(product_name='Other product'), dict(key='OTHER-KEY')]:
            with self.subTest(change=change):
                data = dict(original)
                data['license'] = dict(data['license'], **change)
                self.post.return_value = (200, data)
                self.assertEqual(license_status(app, self.ctx)['Valid'], '0')

    def test_protected_desktop_entry_points_stop_before_work(self):
        for name in ['run_auto_detect', 'export_pdf', 'print_document', 'export_docx',
                     'export_debooklet_scan_pdf', 'export_booklet_pdf', 'open_compress_pdf_dialog']:
            with self.subTest(name=name), patch.object(self.ctx, 'require_current_license', return_value=False) as check:
                getattr(self.ctx, name)()
                check.assert_called_once()

    def test_valid_legacy_fallback_matches_desktop(self):
        self.store(dict(key='INVALID'))
        Path(self.ctx.legacy_license_path).write_text(json.dumps(self.payload()))
        self.assertEqual(license_status(app, self.ctx)['Valid'], '1')

    def test_unsigned_claims_rejected(self):
        value = self.payload()
        value.pop('signature')
        self.store(value)
        self.assertEqual(license_status(app, self.ctx)['Valid'], '0')

    def test_tampered_claims_rejected(self):
        value = self.payload()
        value['claims']['customer'] = 'CHANGED'
        self.store(value)
        state = license_status(app, self.ctx)
        self.assertEqual(state['Valid'], '0')
        self.assertEqual(state['Customer'], '')

    def test_expired_wrong_device_revoked_and_quota(self):
        for changes in [dict(expires_at='2000-01-01'), dict(machine_id='other-device'),
                        dict(status='revoked'), dict(active_devices=3, max_activations=1)]:
            with self.subTest(changes=changes):
                self.store(self.payload(**changes))
                self.assertEqual(license_status(app, self.ctx)['Valid'], '0')


if __name__ == '__main__':
    unittest.main()
