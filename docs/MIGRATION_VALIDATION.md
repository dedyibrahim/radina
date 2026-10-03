# Hasil integrasi — 3 Oktober 2026

Sumber wedding: `dedyibrahim/radina-wedding-platform`, commit `d6500f0`. Bisnis wedding diadaptasi ke Laravel 10 yang sudah ada, dengan frontend Vue 3 pada `frontend/`.

## Preservasi

- Data aplikasi sebelum dan sesudah migrasi sama persis: 3 lisensi, 0 aktivasi perangkat, 2 akun pengguna.
- File asli model License/LicenseActivation, controller aktivasi, config lisensi, dan kedua migration lisensi identik secara byte dengan cadangan.
- APP_KEY, token lisensi, konfigurasi produk, kredensial database, dan password akun lama tidak berubah. Perubahan `.env` hanya APP_NAME dan APP_URL lokal.
- Bisnis berita dikeluarkan dari source aktif. Data berita lama tetap berada dalam database sebagai arsip; source/aset/migration lama tersimpan di cadangan di luar backend.

## Pemeriksaan yang lulus

- Build Vite produksi, termasuk 20 template dan panel lisensi.
- Seluruh pengujian Laravel setelah penambahan ruang pelanggan dan persetujuan: **46 passed, 820 assertions**. Laporan JUnit: `test-results/backend.xml`.
- Perjalanan browser nyata: pilih template, pesan, cek pesanan, bayar/verifikasi, CMS, upload gambar, preview, publikasi, RSVP, ucapan, dan persistensi setelah reload.
- Pemeriksaan responsif halaman publik, admin, editor, dan undangan pada 320, 360, 375, 390, 414, 430, 768, 1024, 1280, dan 1440 px. Laporan: `test-results/platform/report.json`.
- CRUD lisensi melalui browser; token salah, aktivasi berulang, dua perangkat, penolakan perangkat ketiga, cabut/aktifkan, dan penghapusan. Login admin tanpa CSRF ditolak, sedangkan endpoint aktivasi tetap memakai kontrak token desktop.
- Seluruh 20 preview template pada 390 dan 1440 px, tanpa gambar rusak atau error JavaScript. Panel lisensi diperiksa pada 320, 390, 768, dan 1440 px. Laporan: `test-results/integration/report.json`.
- Pemeriksaan sintaks 113 file PHP tanpa kegagalan; route cache berhasil dibuat dan dibersihkan; `git diff --check` bersih.
- Website lokal merespons HTTP 200 dan katalog memuat 20 template.
- Pengujian upgrade dari skema lisensi lama menjalankan migration wedding dan seeder, lalu memastikan seluruh lisensi, aktivasi, dan kredensial akun identik.
- Regresi login dengan domain Sanctum kosong/tidak cocok, session dan logout, CSRF, CAPTCHA wajib/salah/kedaluwarsa/sekali pakai, akses admin aktif, serta batas login dan CAPTCHA yang terpisah.
- Empat pemeriksaan browser buket/kontak: 17 foto asli, harga mulai Rp100.000, tautan produk beserta referensi foto, nomor WhatsApp yang sama pada wedding/buket, redirect `/bucket`, dan layout/tombol mengambang 320?1440 px. Laporan: `test-results/bouquets/report.json`.
- Tujuh pemeriksaan browser ruang pelanggan: tautan/WhatsApp pelanggan, draf dan CSRF tanpa login admin, unggahan foto dan penerapan pengajuan, blok publish sebelum persetujuan, catatan revisi dan preview kedaluwarsa, persetujuan/publish, tampilan 320/390/768/1440 px, serta pembatalan akses saat token diganti/dicabut. Laporan: `test-results/customer-portal/report.json`.
- Pengujian lanjutan versi preview lulus (**17 assertions**) dan memastikan form pelanggan mengikuti hasil koreksi admin setelah pengajuan diterapkan.
- Sembilan pengujian ruang pelanggan: token terenkripsi dan akses terbatas, draf terpisah dari konten aktif, validasi pengajuan, penerapan data/publish dengan preservasi lisensi, persetujuan berdasarkan konten terbaru, revisi terenkripsi, masa berlaku/pergantian/pencabutan token, penolakan perubahan kolom terlindungi/media undangan lain, unggahan batch atomik, dan konflik versi.
- Enam pemeriksaan browser impor: template pelanggan asli diunduh, diisi dan diimpor; rekening hadiah diekspor tanpa kehilangan nol; tamu dan link diimpor/diekspor dengan deduplikasi; baris salah menjaga daftar lama; perubahan manual belum disimpan menghalangi impor; layout 320/390/768/1440 px; undangan dipublish dan link ekspor menampilkan nama tamu yang benar. Laporan: `test-results/wedding-import/report.json`.
- Tujuh pengujian impor: template kosong dan akses admin, pratinjau tanpa perubahan database, penyimpanan atomik, data lisensi/akun tetap identik, validasi konten/URL, penolakan versi editor kedaluwarsa, deduplikasi tamu, file UTF-16, keamanan ekspor spreadsheet, dan pembatasan undangan.
- Tiga pemeriksaan browser pembayaran: kedua rekening dan tombol salin tepat, pesanan wedding baru memakai rekening pemilik dan kontak WhatsApp sebenarnya tanpa pemberitahuan demo, serta layout 320/390/768/1440 px. Laporan: `test-results/payment-accounts/report.json`.
- Delapan pemeriksaan browser login: tampilkan/sembunyikan password, layout 320/390/768/1440 px, CSRF, CAPTCHA/password salah, login dan reload dashboard, logout, dan login kembali. Laporan: `test-results/admin-login/report.json`.
- Pengujian cadangan deployment terenkripsi, deteksi perubahan/hilangnya lisensi, aktivasi desktop saat deployment, serta media hosting tanpa symlink.
- Dua pengujian optimasi upload membuktikan hanya salinan staging file identik yang dilewati, file baru/berubah/hook tetap dikirim, dan manifest tidak terverifikasi selalu memakai upload penuh.
- Dua pengujian script cleanup membuktikan file lisensi, `.env`, storage, dan path di luar daftar berita tidak dapat dihapus.

Semua transaksi browser dan reset pengujian menggunakan database `radina_wedding_test`. Batas API dinaikkan hanya pada proses server uji agar penelusuran otomatis tidak terkena limit 60 permintaan per menit; default aplikasi tetap 60.

## Batas hasil

Hasil pemeriksaan di dokumen ini berasal dari pengujian lokal. Status penerapan produksi diperiksa terpisah melalui GitHub Actions dan HTTP pada `radina.net`. Rekening pembayaran dan WhatsApp bisnis telah diatur sesuai data pemilik; keduanya dapat diubah lewat `/admin/settings`. Isi undangan dan rekening hadiah pengantin demo tetap merupakan contoh. Cadangan sumber dan database sebelum migrasi berada pada `../.migration-backups/20261003-150421/`.

PHP lokal 8.5 menampilkan pemberitahuan deprecation dari test runner vendor; pengujian tetap lulus. CI memakai PHP 8.2.
