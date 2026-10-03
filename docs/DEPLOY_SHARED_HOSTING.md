# Deployment Radina Wedding dan Lisensi

Workflow `.github/workflows/ci-cd.yml` melakukan test MySQL terpisah, build frontend wedding, membuat ZIP produksi, dan menyiapkan upload FTP/FTPS serta deployment hook yang ditandatangani.

## Struktur hosting

Document root memuat `index.php`, `.htaccess`, `assets/`, `brand/`, `images/`, `music/`, `video/`, dan `favicon.svg`. Laravel berada di `_app/`, termasuk `frontend/dist/index.html`, `frontend/public/`, konfigurasi, database, vendor, serta storage. `.htaccess` dalam `_app` menolak akses HTTP langsung ke source dan konfigurasi privat.

PHP 8.2 dengan PDO MySQL, GD, mbstring, fileinfo, intl, curl, OpenSSL diperlukan. Node 22 hanya diperlukan pada mesin build. Simpan `.env` produksi di `_app/.env`; jangan mengganti `APP_KEY`, kredensial database, `LICENSE_ACTIVATION_TOKEN`, atau `LICENSE_PRODUCT_NAME` dari instalasi lisensi yang sudah berjalan. Gunakan `APP_NAME=Radina` dan `APP_URL` domain produksi. Isi `SANCTUM_STATEFUL_DOMAINS` dengan hostname produksi tanpa protokol.

## Migrasi pertama dari portal berita

1. Cadangkan source, `.env`, seluruh database, dan `storage/app/public` produksi.
2. Jalankan pengujian dan build sebelum upload. Workflow selalu membawa aplikasi, konfigurasi, migration, seeder, frontend hasil build, dan aset demo secara lengkap, termasuk saat transisi pertama. ZIP tersedia sebagai artifact alternatif.
3. Pertahankan `.env`, storage pengguna, dan database produksi. Jangan menjalankan `migrate:fresh` atau mengganti APP_KEY.
4. Jalankan `php artisan optimize:clear`, `php artisan migrate --force`, dan `php artisan db:seed --force`. Akun admin lama diberi akses wedding tanpa mengganti password; lisensi tidak disemai ulang.
5. Media `/storage` dapat dilayani langsung oleh Laravel dari disk publik jika hosting tidak menyediakan symlink. Path di luar disk publik dan file konfigurasi privat ditolak.
6. Periksa `/api/license/activate` memakai aplikasi desktop yang sudah ada, lalu `/admin/licenses`, katalog, dan preview. Pastikan jumlah/key/aktivasi lisensi sama dengan cadangan.
7. Isi rekening dan kontak sebenarnya melalui `/admin/settings` sebelum menerima pembayaran.

Endpoint aktivasi lisensi tetap pada domain dan URL sebelumnya. Data berita lama dipertahankan sebagai arsip database. Kode bisnis berita tidak lagi digunakan; URL berita mengembalikan 410.

## GitHub Actions

Environment `production` menggunakan secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `DEPLOY_HOOK_SECRET`, serta variables `FTP_PROTOCOL`, `FTP_SERVER_DIR`, `DEPLOY_URL`. `DEPLOY_URL` wajib HTTPS. Server menggunakan `.env` produksi; kredensial produksi tidak dikirim dari CI.

Deploy hook memverifikasi signature, commit, manifest file, dan SHA-256 `database/seeders/WeddingPlatformSeeder.php` sebelum migrasi dan seeding. Nama header `X-Seed-Sql-Sha256` dipertahankan untuk protokol hook lama, tetapi isinya sekarang digest seeder wedding. Source SQL portal berita tidak lagi dipakai.

Sebelum migrasi, hook membuat cadangan terenkripsi tabel `licenses`, `license_activations`, dan `users` di `_app/storage/app/deploy-backups/`. Cadangan diverifikasi sebelum migrasi dimulai. Setelah migrasi dan setelah seeding, seluruh record lama diperiksa: key, aturan lisensi, identitas perangkat, dan kredensial akun harus tetap sama. Pembaruan waktu aktivasi dan penambahan perangkat oleh aplikasi desktop saat deployment tetap diperbolehkan. Kegagalan pemeriksaan menghentikan deployment dan marker commit produksi tidak diperbarui.

Upload FTP tidak menggunakan opsi delete/mirror-delete. `.env` dan runtime storage dikeluarkan dari upload; APP_KEY, token, database, upload pelanggan, dan sesi produksi tidak ditimpa. File berita yang dihapus dari Git dibersihkan melalui daftar path yang diizinkan, setelah migrasi dan pemeriksaan lisensi berhasil. Script cleanup menolak file lisensi, akun, `.env`, storage, vendor, serta path yang tidak dikenal. Tabel berita lama dalam database tetap sebagai arsip.

Rollback menggunakan cadangan source/build sebelumnya dan `.env` yang sama. Tabel berita lama tetap tersedia; jangan melakukan rollback destruktif pada tabel wedding setelah ada transaksi pelanggan. Simpan cadangan database sebelum setiap perubahan produksi.

## Login admin

Endpoint `/api/admin/*` menggunakan middleware `web` untuk session, cookie, dan CSRF secara eksplisit. Login tidak bergantung pada apakah domain `radina.net` tercantum di `SANCTUM_STATEFUL_DOMAINS`. Kredensial administrator lama tetap digunakan.

Login menampilkan tombol tampilkan/sembunyikan kata sandi serta CAPTCHA penjumlahan. Soal CAPTCHA tersimpan dalam session, berlaku 5 menit, dan hanya dapat dipakai sekali. Jawaban yang salah, kedaluwarsa, atau tanpa session ditolak sebelum pemeriksaan password. Setelah login gagal, halaman mengambil soal baru. Rate limit login tetap 5 permintaan per menit. CAPTCHA tidak membutuhkan API key eksternal.

## Buket dan kontak bisnis

Katalog `/buket` memakai 17 foto asli dari folder buket pemilik, dengan harga mulai Rp100.000 dan konsultasi custom melalui WhatsApp. `/bucket` diarahkan ke `/buket`. Nomor kontak bisnis wedding dan buket adalah `081289903664` (`6281289903664` untuk tautan WhatsApp), diperbarui lewat migration khusus setting tanpa mengubah akun, lisensi, atau aktivasi. Nomor selanjutnya dapat diubah lewat Pengaturan admin. Tombol WhatsApp mengambang tersedia di halaman publik dan tautan produk menyertakan foto referensi pilihan pelanggan.

Deployment membandingkan SHA-256 file dengan manifest commit produksi terakhir yang berhasil. Salinan upload sementara yang identik dapat dilewati; source dan file remote tidak dihapus. Manifest baru tetap memuat semua file yang diharapkan dan hook memverifikasi seluruhnya sebelum migrasi. Jika manifest lama tidak tersedia, rusak, atau tidak sesuai marker commit, semua file tetap dikirim. Hook dan entrypoint selalu dikirim.
