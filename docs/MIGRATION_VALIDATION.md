# Hasil integrasi — 3 Oktober 2026

Sumber wedding: `dedyibrahim/radina-wedding-platform`, commit `d6500f0`. Bisnis wedding diadaptasi ke Laravel 10 yang sudah ada, dengan frontend Vue 3 pada `frontend/`.

## Preservasi

- Data aplikasi sebelum dan sesudah migrasi sama persis: 3 lisensi, 0 aktivasi perangkat, 2 akun pengguna.
- File asli model License/LicenseActivation, controller aktivasi, config lisensi, dan kedua migration lisensi identik secara byte dengan cadangan.
- APP_KEY, token lisensi, konfigurasi produk, kredensial database, dan password akun lama tidak berubah. Perubahan `.env` hanya APP_NAME dan APP_URL lokal.
- Bisnis berita dikeluarkan dari source aktif. Data berita lama tetap berada dalam database sebagai arsip; source/aset/migration lama tersimpan di cadangan di luar backend.

## Pemeriksaan yang lulus

- Build Vite produksi, termasuk 20 template dan panel lisensi.
- Seluruh pengujian Laravel setelah penguatan deployment: **29 passed, 599 assertions**. Laporan JUnit: `test-results/backend.xml`.
- Perjalanan browser nyata: pilih template, pesan, cek pesanan, bayar/verifikasi, CMS, upload gambar, preview, publikasi, RSVP, ucapan, dan persistensi setelah reload.
- Pemeriksaan responsif halaman publik, admin, editor, dan undangan pada 320, 360, 375, 390, 414, 430, 768, 1024, 1280, dan 1440 px. Laporan: `test-results/platform/report.json`.
- CRUD lisensi melalui browser; token salah, aktivasi berulang, dua perangkat, penolakan perangkat ketiga, cabut/aktifkan, dan penghapusan. Login admin tanpa CSRF ditolak, sedangkan endpoint aktivasi tetap memakai kontrak token desktop.
- Seluruh 20 preview template pada 390 dan 1440 px, tanpa gambar rusak atau error JavaScript. Panel lisensi diperiksa pada 320, 390, 768, dan 1440 px. Laporan: `test-results/integration/report.json`.
- Pemeriksaan sintaks 113 file PHP tanpa kegagalan; route cache berhasil dibuat dan dibersihkan; `git diff --check` bersih.
- Website lokal merespons HTTP 200 dan katalog memuat 20 template.
- Pengujian upgrade dari skema lisensi lama menjalankan migration wedding dan seeder, lalu memastikan seluruh lisensi, aktivasi, dan kredensial akun identik.
- Regresi login dengan domain Sanctum kosong/tidak cocok, session dan logout, CSRF, CAPTCHA wajib/salah/kedaluwarsa/sekali pakai, akses admin aktif, serta batas login dan CAPTCHA yang terpisah.
- Delapan pemeriksaan browser login: tampilkan/sembunyikan password, layout 320/390/768/1440 px, CSRF, CAPTCHA/password salah, login dan reload dashboard, logout, dan login kembali. Laporan: `test-results/admin-login/report.json`.
- Pengujian cadangan deployment terenkripsi, deteksi perubahan/hilangnya lisensi, aktivasi desktop saat deployment, serta media hosting tanpa symlink.
- Dua pengujian script cleanup membuktikan file lisensi, `.env`, storage, dan path di luar daftar berita tidak dapat dihapus.

Semua transaksi browser dan reset pengujian menggunakan database `radina_wedding_test`. Batas API dinaikkan hanya pada proses server uji agar penelusuran otomatis tidak terkena limit 60 permintaan per menit; default aplikasi tetap 60.

## Batas hasil

Hasil pemeriksaan di dokumen ini berasal dari pengujian lokal. Status penerapan produksi diperiksa terpisah melalui GitHub Actions dan HTTP pada `radina.net`. Rekening, WhatsApp, dan isi contoh dari proyek wedding tetap berstatus demo dan dapat diatur lewat `/admin/settings`. Cadangan sumber dan database sebelum migrasi berada pada `../.migration-backups/20261003-150421/`.

PHP lokal 8.5 menampilkan pemberitahuan deprecation dari test runner vendor; pengujian tetap lulus. CI memakai PHP 8.2.
