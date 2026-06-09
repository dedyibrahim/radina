# Radina News

Radina News adalah platform portal berita berbasis Laravel dan Inertia.js. Aplikasi mencakup portal berita publik, dashboard redaksi, manajemen penulis, verifikasi artikel, pembayaran honor penulis, withdrawal, kategori, pengguna, dan lisensi aplikasi.

## Teknologi

- PHP 8.1+
- Laravel 10
- MySQL
- Inertia.js
- Vue 3
- Tailwind CSS
- Vite
- Server-side rendering Inertia

## Fitur Utama

### Portal Berita

- Homepage berita modern dan responsif.
- Halaman artikel, arsip, kategori, dan topik.
- Menu kategori berbentuk drawer pada perangkat mobile.
- Konten Bahasa Indonesia dan Inggris.
- Pencarian dan navigasi berita.
- Data dummy berita beserta gambar.
- Sitemap XML, RSS feed, robots.txt, meta tag, Open Graph, dan JSON-LD.
- Favicon dan identitas visual Radina News.

### Dashboard Admin

- Drawer navigasi di sisi kanan.
- Membuat, mengedit, menerbitkan, dan menghapus berita.
- Review editorial dan verifikasi fakta.
- Persetujuan atau penolakan tulisan penulis.
- CRUD kategori berita.
- CRUD akun admin dan penulis.
- Pengaturan honor per artikel untuk setiap penulis.
- Pengelolaan withdrawal penulis.
- Pengelolaan lisensi aplikasi.

### Dashboard Penulis

- Membuat tulisan berdasarkan akun yang sedang login.
- Tulisan otomatis disimpan sebagai draft.
- Melihat status editorial dan verifikasi fakta.
- Melihat honor per artikel dan saldo tersedia.
- Melihat riwayat pendapatan dan withdrawal.
- Mengatur rekening pencairan.
- Mengajukan withdrawal setelah saldo mencapai batas minimum.

## Role dan Hak Akses

### Admin

Admin memiliki akses penuh untuk:

- Mengelola seluruh berita.
- Menyetujui atau menolak artikel.
- Melakukan verifikasi fakta.
- Mengatur tarif honor penulis.
- Memproses withdrawal.
- Mengelola kategori, pengguna, dan lisensi.

### Penulis

Penulis hanya dapat:

- Membuat tulisan baru.
- Melihat tulisan miliknya sendiri.
- Melihat saldo dan riwayat honor.
- Mengatur rekening pribadi.
- Mengajukan withdrawal.

Penulis tidak dapat menerbitkan artikel secara langsung.

## Alur Editorial dan Pembayaran

1. Penulis membuat berita melalui dashboard.
2. Berita disimpan sebagai `draft` dengan status editorial dan verifikasi `pending`.
3. Admin memeriksa isi berita.
4. Admin menyetujui editorial dan mengonfirmasi kebenaran fakta.
5. Artikel otomatis diterbitkan setelah kedua pemeriksaan selesai.
6. Honor penulis dikreditkan satu kali sesuai tarif penulis.
7. Penulis dapat mengajukan withdrawal jika saldo tersedia minimal Rp50.000.
8. Admin memeriksa rekening, menyetujui withdrawal, lalu menandainya sebagai sudah dibayar.

Saldo withdrawal langsung direservasi ketika pengajuan dibuat agar saldo yang sama tidak dapat diajukan lebih dari sekali.

## Instalasi

### Persyaratan

Pastikan perangkat sudah memiliki:

- PHP 8.1 atau lebih baru.
- Composer.
- Node.js 18 atau lebih baru.
- NPM.
- MySQL atau MariaDB.

### Langkah Instalasi

```bash
composer install
npm install
```

Salin konfigurasi environment:

```bash
cp .env.example .env
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Buat application key:

```bash
php artisan key:generate
```

Atur koneksi database pada `.env`:

```env
APP_NAME="Radina News"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=radina_news
DB_USERNAME=root
DB_PASSWORD=
```

Buat tabel dan data dummy:

```bash
php artisan migrate --seed
```

Jalankan aplikasi:

```bash
php artisan serve
```

Pada terminal lain:

```bash
npm run dev
```

Aplikasi dapat dibuka melalui:

```text
http://localhost:8000
```

## Konfigurasi Pembayaran Penulis

Konfigurasi pembayaran tersedia di `config/writer_payments.php`.

Nilainya dapat diubah melalui `.env`:

```env
WRITER_DEFAULT_ARTICLE_FEE=25000
WRITER_MINIMUM_WITHDRAWAL=50000
```

- `WRITER_DEFAULT_ARTICLE_FEE`: tarif default jika admin belum menentukan tarif khusus penulis.
- `WRITER_MINIMUM_WITHDRAWAL`: batas minimum pengajuan withdrawal.

Perubahan konfigurasi environment perlu diikuti dengan:

```bash
php artisan optimize:clear
```

## Akun Dummy

### Admin

```text
Email: admin@radina.net
Password: Admin@12345
```

### Penulis

Semua akun penulis dummy menggunakan password `Editor@12345`.

```text
nadia@radina.net
rafi@radina.net
alya@radina.net
dimas@radina.net
```

Akun Nadia sudah memiliki data dummy rekening, artikel tervalidasi, dan saldo honor sehingga alur withdrawal dapat langsung diuji.

## Build Production

Build aset browser dan bundle SSR:

```bash
npm run build
```

Bersihkan dan optimalkan cache Laravel:

```bash
php artisan optimize
```

Jika server-side rendering digunakan, jalankan:

```bash
npm run ssr
```

Untuk deployment production, pastikan:

```env
APP_ENV=production
APP_DEBUG=false
```

Web server harus diarahkan ke folder `public`.

### CI/CD Shared Hosting

Repository menyediakan GitHub Actions untuk menjalankan test, build production, dan deployment otomatis melalui FTP/FTPS langsung ke `public_html`. Source Laravel ditempatkan pada folder terlindungi `_app`.

Deployment pertama menggunakan artifact ZIP agar folder `vendor` tidak ditransfer satu per satu. Deployment FTP berikutnya tidak mengunggah ulang `vendor`.

Pada hosting tanpa SSH, migrasi production dapat dijalankan otomatis melalui deployment hook HTTPS dengan signature HMAC.

Panduan konfigurasi GitHub Secrets, target `public_html`, `.env`, dan deployment pertama tersedia di:

[`docs/DEPLOY_SHARED_HOSTING.md`](docs/DEPLOY_SHARED_HOSTING.md)

## Menjalankan Test

Jalankan seluruh test:

```bash
php artisan test
```

Test mencakup:

- Autentikasi.
- Hak akses admin dan penulis.
- CRUD berita dan kategori.
- Portal berita publik.
- Review editorial dan verifikasi fakta.
- Kredit honor tanpa duplikasi.
- Pengaturan rekening.
- Minimum withdrawal.
- Proses persetujuan dan pembayaran withdrawal.

## Struktur Penting

```text
app/Http/Controllers      Controller portal, dashboard, berita, dan pembayaran
app/Models                Model berita, pengguna, honor, dan withdrawal
app/Services              Layanan kredit honor penulis
database/migrations       Struktur database
database/seeders          Akun dan data dummy
resources/js/Layouts      Layout portal dan dashboard
resources/js/Pages        Halaman Inertia Vue
routes/web.php            Route portal dan dashboard
tests/Feature             Pengujian fitur aplikasi
```

## Perintah Database

Menjalankan migration yang belum diterapkan:

```bash
php artisan migrate
```

Mengisi ulang data dummy tanpa menghapus data:

```bash
php artisan db:seed
```

Menghapus seluruh data, membuat ulang tabel, dan menjalankan seeder:

```bash
php artisan migrate:fresh --seed
```

> Perintah `migrate:fresh` menghapus seluruh data pada database yang digunakan.

## Kontak

Radina News  
Telepon: 877-2417-0145
