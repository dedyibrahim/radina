# Deployment Shared Hosting dengan GitHub Actions

Workflow `.github/workflows/ci-cd.yml` menjalankan test Laravel, build Vite, membuat paket production, lalu mengunggahnya ke `public_html` melalui FTP atau FTPS. Migrasi database dilakukan manual.

## Persyaratan Hosting

- PHP 8.1 atau lebih baru; PHP 8.2 direkomendasikan.
- MySQL 8 atau MariaDB yang kompatibel.
- Ekstensi PHP: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, dan `xml`.
- Domain harus diarahkan ke folder `public` milik Laravel.
- Akses FTP ke `public_html`.
- phpMyAdmin atau fasilitas database dari panel hosting untuk migrasi manual.

Workflow otomatis membuat struktur berikut:

```text
/public_html/
├── _app/         <- source Laravel, diblokir oleh .htaccess
│   ├── app/
│   ├── bootstrap/
│   ├── storage/
│   ├── vendor/
│   └── artisan
├── build/
├── images/
├── .htaccess
└── index.php
```

`index.php` di root `public_html` sudah diarahkan ke aplikasi dalam `_app`. Folder `_app` dilindungi dari akses browser menggunakan `.htaccess`.

## GitHub Environment

Di repository GitHub buka:

`Settings > Environments > New environment > production`

Tambahkan secrets berikut pada environment `production`:

| Secret | Keterangan |
| --- | --- |
| `FTP_SERVER` | Host FTP, misalnya `ftp.domain.com` |
| `FTP_USERNAME` | Username FTP |
| `FTP_PASSWORD` | Password FTP |

Tambahkan variables berikut:

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `FTP_PROTOCOL` | `ftp` atau `ftps` | Protokol server |
| `FTP_SERVER_DIR` | `/public_html/` | Folder web utama pada koneksi FTP |

Jika akun FTP langsung membuka isi `public_html`, gunakan `/` sebagai nilai `FTP_SERVER_DIR`.

## Konfigurasi `.env` Production

File `.env` tidak pernah dikirim oleh workflow. Buat file lokal, lalu upload melalui FTP ke:

```text
public_html/_app/.env
```

Gunakan konfigurasi production:

```dotenv
APP_NAME="Radina News"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://domainanda.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=user_database
DB_PASSWORD=password_database

CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

WRITER_DEFAULT_ARTICLE_FEE=25000
WRITER_MINIMUM_WITHDRAWAL=50000
```

Jika belum memiliki `APP_KEY`, buat dari komputer lokal:

```bash
php artisan key:generate
```

Salin nilai `APP_KEY` dari `.env` lokal ke `public_html/_app/.env`. Jangan menggantinya setelah aplikasi digunakan karena session dan data terenkripsi lama tidak dapat dibaca.

## Deployment Pertama

1. Buat database dan user database dari panel hosting.
2. Konfigurasikan GitHub Environment dan secrets.
3. Pastikan `FTP_SERVER_DIR` menunjuk ke `/public_html/`, atau `/` jika login FTP langsung berada di folder tersebut.
4. Buka tab `Actions`, pilih `CI/CD Shared Hosting`, lalu klik `Run workflow`.
5. Upload `.env` production ke `public_html/_app/.env`.
6. Import struktur/data database secara manual melalui phpMyAdmin.
7. Atur permission `public_html/_app/storage` dan `public_html/_app/bootstrap/cache` menjadi `775` melalui File Manager atau FTP jika hosting memerlukannya.

Seeder dan migrasi Artisan tidak dijalankan otomatis karena deployment ini tidak memakai SSH.

## Deployment Berikutnya

Setiap push ke branch `main` akan:

1. Menjalankan seluruh test dengan MySQL.
2. Membangun frontend production.
3. Menginstal dependency Composer tanpa paket development.
4. Mengunggah perubahan melalui FTP/FTPS.
5. Menampilkan pengingat untuk memeriksa `.env` dan migrasi database manual.

File `_app/.env`, upload pengguna, session, cache runtime, dan log tidak akan dihapus oleh proses sinkronisasi FTP.

## Rollback

Workflow tidak mengubah data database sebelum seluruh test berhasil. Untuk rollback kode:

1. Revert commit bermasalah di GitHub.
2. Push hasil revert ke `main`.
3. Workflow akan mengunggah versi kode sebelumnya.

Migrasi database yang bersifat destruktif harus memiliki strategi rollback sendiri dan tidak boleh mengandalkan rollback kode saja.
