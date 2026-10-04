# Radina Invitations + License Server

RadinaNet menjalankan bisnis undangan digital untuk berbagai acara, diadaptasi dari https://github.com/dedyibrahim/radina-wedding-platform. Backend Laravel 10 dan server lisensi aplikasi yang sudah ada dipertahankan. Frontend Vue 3 berada di `frontend/` dan menggunakan API Laravel dengan sesi Sanctum.

## Fitur

- Marketplace 111 template dalam 11 kategori, setiap kategori minimal lima desain; pencarian, kategori, favorit, preview, dan pemesanan.
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

Pembayaran wedding dan buket menggunakan Bank Mandiri `1680001279155` dan Bank BCA `8721354342`, keduanya a/n Dedy Ibrahim. WhatsApp bisnis: `081289903664`. Kedua rekening dapat disalin dari halaman pembayaran dan diubah melalui `/admin/settings`; rekening kedua opsional dan harus diisi lengkap bila digunakan. Rekening hadiah pada undangan demo tetap merupakan data contoh pengantin.

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

Pengujian browser harus memakai server dengan database uji, `TEST_URL`, `TEST_ADMIN_EMAIL`, dan `TEST_ADMIN_PASSWORD`. Jalankan `npm.cmd run test:e2e` untuk perjalanan pelanggan/admin/tamu, dan `npm.cmd run test:integration` untuk lisensi, preview, dan pemeriksaan responsif. Hasil tersimpan pada `test-results/`.

Lihat `docs/DEPLOY_SHARED_HOSTING.md` untuk deployment. Migrasi lokal tidak mempublikasikan perubahan ke hosting.

## Impor data pelanggan dan daftar tamu

Pada halaman kelola `/admin/weddings/{id}`, buka tab **Impor / Ekspor**.

1. Unduh **Template Pernikahan**, bagikan ke pelanggan, dan minta mereka mengisi kolom `nilai`. Nama pengantin, acara, cerita, URL galeri/musik, pengaturan fitur, dan metode hadiah dapat diimpor sekaligus. Kolom kosong mempertahankan data tersimpan. Foto lokal tetap diunggah melalui editor.
2. Simpan spreadsheet sebagai **CSV UTF-8**, unggah, pilih **Periksa Data Pernikahan**, lalu tinjau perubahan dan pilih **Impor & Simpan Pernikahan**. Perubahan langsung disimpan; undangan aktif langsung memakai konten baru. Simpan perubahan editor sebelum impor.
3. Unduh **Template Tamu**, isi kolom `nama` dan `alamat` (satu tamu/keluarga per baris), lalu periksa dan impor. Batas 1.000 baris / 2 MB per file, 10.000 tamu per undangan. Nama dan alamat yang sama, tanpa membedakan huruf besar/kecil, dilewati saat impor ulang. Tidak ada data lama yang dihapus oleh impor.
4. Pilih **Unduh Tautan Tamu** untuk CSV berisi nama, alamat, dan link personal siap dibagikan. Nama yang sama di alamat berbeda mendapat token berbeda. Tautan memakai slug undangan terkini, dan baru bisa dibuka ketika undangan dipublish. Alamat tidak disertakan pada URL publik.

CSV mendukung pemisah titik koma, koma, dan tab serta file UTF-16 dari Excel. Tanggal harus `YYYY-MM-DD`, jam `HH:MM`, dan pilihan fitur `ya`/`tidak`. Format kolom nilai sebagai Teks sebelum mengisi nomor rekening/telepon agar nol di depan tidak hilang. Ekspor melindungi nilai dari formula spreadsheet. Galat data menggagalkan seluruh impor; sesi editor yang berubah sejak pratinjau ditolak agar perubahan lain tidak tertimpa. Impor hanya tersedia bagi admin aktif dan undangan dengan pembayaran terkonfirmasi.

## Ruang pelanggan dan persetujuan preview

Buka tab **Pelanggan** pada halaman kelola undangan berbayar dan pilih **Buat Tautan Pelanggan**. Tautan pribadi berlaku 30 hari; salin atau bagikan lewat tombol WhatsApp. Pelanggan tidak perlu akun admin dan hanya dapat membuka pesanan pada tautan tersebut. Buat ulang tautan untuk memperpanjang masa berlaku sekaligus membatalkan tautan lama, atau pilih **Nonaktifkan Tautan**.

Pelanggan mengisi nama/keluarga pengantin, tanggal, acara, cerita, foto, dan metode hadiah. **Simpan Draf** menjaga progres; **Kirim Data ke Admin** mengirim pengajuan untuk diperiksa. Draf dan pengajuan disimpan terpisah dari konten undangan. Admin memeriksa **Preview Pengajuan**, lalu **Terapkan Data Pelanggan**. Template, musik, dan pengaturan tampilan mengikuti editor. Pada undangan yang sudah aktif, penerapan data langsung memperbarui halaman publik dan modal memperingatkan perilaku ini.

Setelah admin menerapkan data atau memilih **Kirim Preview untuk Ditinjau**, pelanggan membuka **Preview & Persetujuan** pada tautan yang sama. Pelanggan dapat memilih **Sudah Sesuai, Saya Setujui** atau mengirim catatan revisi. Persetujuan terikat pada konten yang dilihat: preview kedaluwarsa ditolak, dan perubahan konten membutuhkan persetujuan ulang. Undangan dengan portal aktif wajib memiliki persetujuan atas versi terbaru sebelum publish. Menonaktifkan portal mengembalikan alur publish manual. Tidak ada pengiriman pesan WhatsApp otomatis.

Token acak 256-bit disimpan sebagai hash dan salinan terenkripsi; data pengajuan dan catatan revisi juga dienkripsi menggunakan APP_KEY yang sudah ada. Halaman dan API pelanggan memakai noindex, no-store, dan no-referrer. Mutasi memakai CSRF, pemeriksaan pembayaran, batas akses, dan versi optimistis agar perubahan perangkat/sesi lain tidak tertimpa. Foto pelanggan memakai validasi serta konversi WebP yang sama dengan admin, dibatasi ke undangan sendiri (maksimal 10 foto per unggahan, 12 MB per foto, 24 megapiksel). Pelanggan tidak dapat mengubah status publish, template, slug, harga, rekening bisnis, pengguna, atau lisensi.

Tab **Daftar Tamu / Impor & Ekspor** pada tautan pelanggan menyediakan template CSV nama/alamat, pemeriksaan sebelum impor, pembuatan link tamu otomatis, pencarian, salin tautan, dan unduhan seluruh daftar beserta linknya. Batas dan penanganan duplikat mengikuti impor admin; data tamu lama dipertahankan. Akses selalu terikat pada undangan milik token aktif dan pesanan berbayar. Menambah tamu tidak mengubah konten atau membatalkan persetujuan preview. Link tamu baru aktif ketika undangan dipublish.

Preview persetujuan dirender dalam iframe pada `/pelanggan/{token}/preview`, sehingga latar posisi tetap dan scroll template tetap berada di bingkai dan tidak menutupi kontrol portal. Tombol persetujuan tersedia setelah renderer selesai dimuat dan fingerprint preview sesuai; perubahan konten saat memuat meminta pelanggan memperbarui preview. Penolakan preview kedaluwarsa di server tetap berlaku. Halaman preview dan API tamu memakai header privasi yang sama dengan portal.

## Musik pilihan pemilik

Katalog menggunakan enam file MP3 dari folder musik pemilik, disalin tanpa konversi. Karena file bernama `1.mp3` sampai `6.mp3` tidak berisi metadata judul/artis, katalog menampilkan **Musik 1** sampai **Musik 6** dengan durasi aslinya. Judul, kategori, dan artis dapat diubah melalui **Music Library**.

Migration `2026_10_03_000010` mengganti seluruh katalog lama dan playlist semua undangan, termasuk undangan pelanggan yang aktif, dengan musik baru sesuai permintaan pemilik. Playlist baru mempertahankan jumlah lagu hingga enam; undangan tanpa playlist mendapat satu lagu dan demo memakai dua lagu. Volume, shuffle, repeat, autoplay, status publikasi, dan data undangan lainnya tetap mengikuti pengaturan tersimpan. Persetujuan pelanggan atas preview perlu diperbarui bila konten musik berubah.

Sebelum mengganti data, file baru diverifikasi dengan ukuran dan SHA-256 serta dipasang di storage publik. Katalog dan playlist sebelumnya dicadangkan terenkripsi pada `storage/app/music-catalog-backups/`. Migrasi berjalan satu kali; seeding berikutnya memasang aset tanpa menghapus katalog atau menimpa perubahan musik admin. Media upload pelanggan dan file runtime lama dipertahankan. Perlindungan lisensi deployment tetap aktif.

## Jenis acara dan lima tema Islami

Jenis acara tersedia pada koleksi, detail template, dan pemesanan: **Pernikahan, Khitanan, Acara Kantor, Ulang Tahun, Aqiqah, dan Acara Lainnya**. Pilihan diteruskan ke preview dan pesanan. Form nonpernikahan memakai judul acara dan penyelenggara; khitanan, aqiqah, dan ulang tahun juga memakai nama anak/tokoh yang dirayakan. Tidak perlu mengisi nama pengantin untuk acara tersebut.

Lima tema tambahan pada kategori **Islamic** adalah **Nur Jannah**, **Mihrab Emerald**, **Sahara Gold**, **Qamar Blue**, dan **Zahra Ivory**. Tema Sakinah sebelumnya tetap tersedia, sehingga kategori Islamic kini berisi sebelas desain, termasuk lima tambahan Floral Atelier. Buka `/templates?category=islamic` dan pilih jenis acara untuk melihat contoh yang sesuai. Desain tambahan memiliki cover, warna, dan ornamen berbeda; setiap preview dapat dibuka sebelum pemesanan.

Di editor admin, **Informasi Dasar ? Jenis acara** menentukan form **Pengantin** atau **Data Acara**, label tanggal, checklist publish, dan renderer. Form pelanggan pribadi mengikuti jenis acara yang ditentukan admin. Foto anak atau logo penyelenggara, agenda, cerita/informasi acara, galeri, musik, RSVP, ucapan, peta, dan link personal tamu dapat digunakan. Hadiah dimatikan pada undangan nonpernikahan baru; admin dapat mengaktifkannya bila diperlukan. Setelah mengganti jenis acara pada undangan lama, periksa judul, teks, dan agenda pada preview sebelum menyimpan/publish.

Tab **Impor / Ekspor** menampilkan **Unduh Template Acara** pada undangan nonpernikahan. CSV memakai `event_details.host_name`, nama anak/tokoh, keluarga, deskripsi, dan foto/logo sebagai pengganti kolom pengantin. Jenis acara mengikuti editor admin dan tidak dapat diganti melalui CSV atau form pelanggan. Impor/ekspor tamu dan persetujuan preview berlaku untuk semua jenis acara.

Migration `2026_10_03_000011` menambah kolom klasifikasi dan data acara. Undangan/pesanan lama otomatis bertipe `wedding`; isi pasangan, URL `/w/{slug}`, musik, dan publikasi tetap tersedia. Penambahan metadata yang tidak terlihat tidak membatalkan persetujuan pernikahan yang isinya tetap sama. Tabel/model lisensi dan perlindungan CI/CD tetap menggunakan kontrak sebelumnya.

Pengujian browser khusus acara: `npm run test:events`, memakai server dan database uji terpisah dengan `TEST_URL`, `TEST_ADMIN_EMAIL`, serta `TEST_ADMIN_PASSWORD`. Mode `READ_ONLY_PRODUCTION=1` hanya mengizinkan pemeriksaan tampilan/API di `radina.net`; tidak membuat pesanan, mengubah undangan, atau menjalankan migrasi.

## Katalog dan animasi undangan

Katalog berisi **111 template**, termasuk **55 tambahan Floral Atelier** (lima baru di masing-masing dari 11 kategori). Romantic, Minimalist, Traditional, Modern, Destination, Luxury, Garden, Cinematic, Vintage, dan Creative masing-masing **10 desain**, serta Islamic **11 desain**. Seluruh 56 template sebelumnya tetap tersedia. Sebanyak 31 desain Studio sebelumnya memakai komposisi berbeda seperti kolase foto, gerbang wayang, kartu pos, tirai gala, amplop, piringan hitam, dan pesta balon. Thumbnail WebP diambil dari cover undangan yang benar-benar dirender. Seluruh desain dapat digunakan untuk enam jenis acara.

Semua template memiliki minimal dua efek gerakan yang sesuai desain, dari 19 efek: confetti, balon, origami, lentera, hati, pita, daun, kelopak, geometri, dandelion, aurora, kilau, ombak, burung, gelembung, kunang-kunang, film, bintang, dan bintang jatuh. Pembukaan undangan menampilkan semburan partikel. Tombol **Animasi ON/OFF** menyimpan pilihan perangkat; partikel otomatis berhenti bila perangkat memilih gerakan rendah, tab tidak aktif, atau preview di luar layar. Partikel tidak menghalangi tombol dan form.

Seluruh **111 template** juga memakai kedalaman CSS 3D: lapisan cover, foto, kartu acara/hadiah dan galeri menggunakan perspektif, rotasi sumbu 3D, elevasi dan bayangan. Gerakan mouse memberi parallax lembut; perangkat sentuh memakai gerakan lapisan perlahan untuk elemen yang terlihat. Animasi desain asli dipertahankan. Efek mengikuti tombol Animasi, preferensi reduced motion, visibilitas halaman dan iframe. Ini adalah efek visual CSS 3D, tanpa model WebGL atau akses sensor perangkat. Kontrol tetap dapat diklik; latar dan navigasi tetap tidak ditransformasi.

Pengujian khusus: `npm run test:customer-tools` untuk impor/ekspor, preview desktop/HP dan persetujuan terbaru/kedaluwarsa; `npm run test:depth` untuk cover serta isi seluruh 111 template, jenis acara lain, parallax dan pengaturan gerakan. Gunakan server uji `TEST_URL=http://127.0.0.1:8001`; pengujian pelanggan membutuhkan `TEST_ADMIN_EMAIL` dan `TEST_ADMIN_PASSWORD` untuk membuat pesanan tiruan pada database uji.

`config/template-studio.json` mendefinisikan 31 komposisi baru; `config/template-presets.json` menyimpan preset 56 template awal. Koleksi tambahan memakai `config/floral-collection.json`, `config/floral-presets.json`, dan `config/floral-demos.json`; setiap kategori memiliki komposisi lengkung, surat, editorial, sinematik, dan carousel. Bunga SVG berlapis ada di empat sudut cover serta tiap bagian, dengan gerakan mengayun, mekar, daun tertiup, melayang, dan kupu-kupu. Galeri, profil, dan bingkai mengikuti komposisi desain. Carousel mendukung perpindahan foto manual. Gerakan bunga ikut berhenti di luar layar, saat tab tidak aktif, dan saat animasi dimatikan. `config/motion-effects.json` berisi nama efek untuk katalog. Seeding menambah desain/demo tanpa mengganti data, harga/status yang disesuaikan admin, persetujuan pelanggan, musik, atau lisensi.

Jalankan `npm.cmd run test:templates` dengan `TEST_URL=http://127.0.0.1:8001` dan server yang menggunakan database uji untuk memeriksa semua 111 preview, jumlah tiap kategori, lima jenis nonpernikahan, dan kontrol animasi. Tambahkan `CAPTURE_TEMPLATE_COVERS=1` hanya ketika perlu menghasilkan ulang 31 thumbnail. Gunakan `READ_ONLY_PRODUCTION=1` dan `TEST_URL=https://radina.net` untuk pemeriksaan tanpa mutasi di produksi; mode ini membatasi laju permintaan dan tidak menulis aset.

Pengujian koleksi Floral Atelier: `npm run test:floral` dengan `TEST_URL=http://127.0.0.1:8001`. Tambahkan `CAPTURE_FLORAL_COVERS=1` untuk memperbarui hanya 55 thumbnail baru dari cover yang dirender. Skrip menolak server selain server uji lokal. `scripts/create-floral-collection.py` memperbarui definisi tambahan, bukan data pelanggan atau preset lama.

## Google Analytics

GA4 menggunakan properti sebelumnya, `G-7BZHBM3W8L`, melalui `GOOGLE_ANALYTICS_ID` dan `GOOGLE_ANALYTICS_ENABLED`. Bila flag tidak ditentukan, tracking aktif hanya pada `APP_ENV=production`. Flag eksplisit `false` tetap menonaktifkannya. Konfigurasi disuntikkan server; tag dimuat sekali oleh Vue pada halaman pemasaran publik, koleksi/detail/preview template, buket, dan form pemesanan. Navigasi SPA mencatat `page_view` secara manual. Preview kecil dalam iframe, admin, portal pelanggan, tautan tamu, undangan pelanggan, pemeriksaan pesanan dan halaman konfirmasi tidak memuat/mengirim Analytics. Navigasi menuju halaman pribadi menonaktifkan pengiriman tag.

**Pengaturan wajib di properti GA:** Admin → Data streams → stream radina.net → Enhanced measurement → Page views → Advanced settings → matikan **Page changes based on browser history events**. `send_page_view: false` mencegah page view awal otomatis, tetapi tidak menonaktifkan Enhanced Measurement history. Tanpa pengaturan tersebut, perpindahan Vue bisa tercatat dua kali. Lihat [panduan page view Google](https://developers.google.com/analytics/devguides/collection/ga4/views).

Event bisnis: `view_template`, `preview_template`, `click_whatsapp` (lokasi tombol), `begin_checkout`, dan `generate_lead` hanya setelah pembuatan pesanan berhasil. Nilai checkout/lead menggunakan IDR; lead bukan konfirmasi pembayaran. Parameter dibatasi pada template, jenis acara, lokasi tombol dan nilai. Nama, kontak, token, nomor pesanan, query URL dan hash tidak dikirim oleh kode tracking ini. Referer eksternal hanya berisi origin; referer internal hanya halaman pemasaran yang dikenal. Tag yang diblokir tidak menghambat pemesanan.

Periksa Network browser untuk `gtag/js?id=G-7BZHBM3W8L` dan `/g/collect`, lalu buka Realtime di properti yang sama. Pengujian unit: `npm run test:analytics` (juga dijalankan CI). Pengujian browser: `TEST_URL=http://127.0.0.1:8001 npm run test:analytics-browser`; tag dan pembuatan pesanan dimock sehingga tidak mengirim event ke Google atau menambah pesanan.
