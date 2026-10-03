# Radina Wedding + License Server

RadinaNet sekarang menjalankan bisnis undangan pernikahan dari https://github.com/dedyibrahim/radina-wedding-platform. Backend Laravel 10 dan server lisensi aplikasi yang sudah ada dipertahankan. Frontend Vue 3 berada di `frontend/` dan menggunakan API Laravel dengan sesi Sanctum.

## Fitur

- Marketplace 20 template, pencarian, kategori, favorit, preview, dan pemesanan.
- Cek pesanan, transfer manual, konfirmasi WhatsApp, dan verifikasi pembayaran admin.
- CMS undangan: pasangan, acara, cerita, galeri, video, livestream, playlist musik, pengaturan bagian, dan hadiah bank/e-wallet/QRIS/fisik.
- Preview, publikasi, RSVP, ucapan, dan moderasi ucapan.
- Dashboard pesanan, pengelolaan template, pustaka musik, dan pengaturan bisnis.
- Pengelolaan lisensi aplikasi pada `/admin/licenses`; aktivasi desktop tetap memakai `/api/license/activate`.

## Instalasi dan menjalankan

PHP 8.1+ dengan PDO MySQL, GD, fileinfo, mbstring, intl, curl, OpenSSL; Composer; Node 22; MySQL 8. PHP 8.2–8.4 disarankan untuk Laravel 10.

Jalankan dari folder `backend`:

```powershell
composer install
npm.cmd ci
npm.cmd run build
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Buka `http://127.0.0.1:8000`; admin pada `/admin/login`. Untuk pengembangan frontend, `npm.cmd run dev` membuka Vite pada port 5173 dengan proxy ke API port 8000.

Instalasi lama menggunakan akun dan password administrator yang sudah ada. Instalasi baru perlu mengisi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` pada `.env`. Seeder tidak mengganti password akun lama dan tidak membuat atau mengganti lisensi.

Rekening, WhatsApp, dan isi undangan demo berasal dari proyek sumber. Atur detail bisnis sebenarnya melalui `/admin/settings` sebelum menerima pembayaran. Pemberitahuan bahwa detail pembayaran masih contoh tersedia pada halaman pembayaran.

## Perlindungan lisensi dan data lama

Model `License`, `LicenseActivation`, controller aktivasi, konfigurasi lisensi, dan migration lisensi lama dipertahankan. Token, APP_KEY, format license key, aturan kedaluwarsa, pencabutan, dan batas perangkat tetap berlaku. Endpoint aktivasi desktop tidak memerlukan sesi browser atau CSRF.

URL CRUD lisensi lama `/licenses` tetap tersedia bagi admin. `/dashboard?section=licenses` menuju panel lisensi baru. Data lisensi dan akun lama tidak direset saat migrasi.

Kode, aset, dan migration berita sudah dikeluarkan dari aplikasi aktif. URL berita, kategori/topik berita, RSS, dan news sitemap mengembalikan HTTP 410. Data berita/honor lama dalam database dipertahankan sebagai arsip; tabel tersebut tidak digunakan wedding. Tidak ada migration yang menghapus tabel lisensi atau data berita lama.

Cadangan sebelum integrasi disimpan di folder `.migration-backups` pada direktori induk backend. Cadangan mengandung konfigurasi privat dan database, sehingga harus disimpan di luar document root dan tidak dipublikasikan.

## Pengujian

Database uji bernama `radina_wedding_test`, terpisah dari database aplikasi. Buat database itu dengan akses pengguna database lokal, lalu:

```powershell
php artisan test
```

`Tests/TestCase.php` memeriksa nama database dan lingkungan sebelum `RefreshDatabase` dapat menjalankan reset. Pengujian mencakup pembayaran, publikasi, hak akses, upload, hadiah terenkripsi, musik, pergantian template, serta kompatibilitas dan preservasi lisensi.

Pengujian browser harus memakai server dengan database uji, `TEST_URL`, `TEST_ADMIN_EMAIL`, dan `TEST_ADMIN_PASSWORD`. Jalankan `npm.cmd run test:e2e` untuk perjalanan pelanggan/admin/tamu, dan `npm.cmd run test:integration` untuk lisensi, 20 preview, dan pemeriksaan responsif. Hasil tersimpan pada `test-results/`.

Lihat `docs/DEPLOY_SHARED_HOSTING.md` untuk deployment. Migrasi lokal tidak mempublikasikan perubahan ke hosting.
