# Deployment Shared Hosting dengan GitHub Actions

Workflow `.github/workflows/ci-cd.yml` menjalankan test Laravel, build Vite, membuat paket production, lalu mengunggahnya ke `public_html` melalui FTP atau FTPS. Migrasi production dapat berjalan otomatis melalui deployment hook HTTPS tanpa SSH.

## Persyaratan Hosting

- PHP 8.1 atau lebih baru; PHP 8.2 direkomendasikan.
- MySQL 8 atau MariaDB yang kompatibel.
- Ekstensi PHP: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, dan `xml`.
- Akses FTP ke `public_html`.
- HTTPS aktif pada domain production.

Workflow membuat struktur berikut:

```text
/public_html/
|-- _app/         <- source Laravel, diblokir oleh .htaccess
|   |-- app/
|   |-- bootstrap/
|   |-- storage/
|   |-- vendor/
|   `-- artisan
|-- build/
|-- images/
|-- .htaccess
`-- index.php
```

`index.php` di root `public_html` diarahkan ke aplikasi dalam `_app`. Folder `_app` dilindungi dari akses browser menggunakan `.htaccess`.

## GitHub Environment

Buka `Settings > Environments > production` pada repository GitHub.

Tambahkan secrets:

| Secret | Keterangan |
| --- | --- |
| `FTP_SERVER` | Host FTP, misalnya `ftp.domain.com` |
| `FTP_USERNAME` | Username FTP |
| `FTP_PASSWORD` | Password FTP |
| `DEPLOY_HOOK_SECRET` | Secret acak untuk signature migrasi |

Tambahkan variables:

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `FTP_PROTOCOL` | `ftp` atau `ftps` | Protokol server |
| `FTP_SERVER_DIR` | `/public_html/` | Folder web utama pada koneksi FTP |
| `DEPLOY_URL` | `https://domainanda.com` | URL production tanpa garis miring di akhir |

Jika akun FTP langsung membuka isi `public_html`, gunakan `/` sebagai `FTP_SERVER_DIR`.

Gunakan `FTP_PROTOCOL=ftp` jika hosting hanya memberikan FTP biasa. Gunakan `ftps` hanya jika provider memberikan hostname FTPS resmi dengan sertifikat valid.

Secrets database tidak diperlukan di GitHub. Job CI memakai MySQL sementara, sedangkan database production hanya dikonfigurasi melalui `public_html/_app/.env`.

## Konfigurasi `.env` Production

File `.env` tidak dikirim workflow. Upload secara manual ke:

```text
public_html/_app/.env
```

Contoh konfigurasi:

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

DEPLOY_HOOK_ENABLED=true
DEPLOY_HOOK_SECRET=masukkan_secret_acak_64_karakter
DEPLOY_HOOK_SIGNATURE_TTL=300
```

Jika belum memiliki `APP_KEY`, jalankan `php artisan key:generate` dari komputer lokal lalu salin nilainya. Jangan mengganti `APP_KEY` setelah aplikasi digunakan.

## Migrasi Otomatis Tanpa SSH

Setelah upload FTP selesai, GitHub Actions memanggil `/deploy-hook.php`. Hook mandiri membersihkan cache konfigurasi/route lama, kemudian menjalankan:

```bash
php artisan migrate --force
php artisan db:seed --class=Database\\Seeders\\DatabaseSeeder --force
```

Buat secret acak:

```bash

php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

Simpan nilai yang sama pada:

1. GitHub Environment secret `DEPLOY_HOOK_SECRET`.
2. `public_html/_app/.env` pada `DEPLOY_HOOK_SECRET`.

Hook dilindungi HMAC SHA-256, timestamp maksimal lima menit, commit SHA, dan file lock untuk mencegah deployment paralel. `DEPLOY_URL` wajib HTTPS dan secret tidak dikirim dalam request.

Migration dan seeder selalu dijalankan otomatis pada deployment production. Workflow berhenti sebelum upload jika `DEPLOY_URL` atau `DEPLOY_HOOK_SECRET` belum dikonfigurasi.

## Deployment Pertama

1. Buat database dan user database pada panel hosting.
2. Konfigurasikan GitHub Environment.
3. Jalankan workflow `CI/CD Shared Hosting`.
4. Download artifact `radina-production-...`.
5. Ekstrak artifact hingga mendapatkan `radina-production.zip`.
6. Upload ZIP ke `public_html` melalui File Manager, lalu pilih **Extract**.
7. Hapus ZIP dari hosting setelah ekstraksi.
8. Upload `.env` ke `public_html/_app/.env`.
9. Pastikan permission `_app/storage` dan `_app/bootstrap/cache` dapat ditulis PHP.
10. Jalankan kembali workflow agar deployment hook menjalankan migrasi pertama.

Seeder berjalan otomatis setelah migration. Prosesnya idempotent: password admin existing tidak direset, lisensi existing tidak ditimpa, dan artikel portal diarahkan ke akun Shara.

## Deployment Berikutnya

Setiap push ke `main` akan:

1. Menjalankan seluruh test dengan MySQL.
2. Membangun frontend production.
3. Membuat ZIP production sebagai artifact.
4. Membaca marker commit production `.radina-deploy-commit`.
5. Membuat staging yang hanya berisi file berubah sejak deployment berhasil terakhir.
6. Mengunggah staging melalui FTP tanpa `--delete` dan tanpa memindai seluruh release.
7. Menjalankan migration dan seeder production melalui HTTPS.
8. Memperbarui marker commit hanya setelah seluruh deployment berhasil.

File `_app/.env`, upload pengguna, session, cache runtime, dan log tidak dihapus oleh sinkronisasi FTP.

Workflow tidak menghapus file atau folder lain dalam `public_html`, termasuk subdomain, `error_log`, dan arsip manual. Jika sebuah file aplikasi memang perlu dihapus, hapus manual melalui File Manager setelah deployment.

Jika `composer.lock` berubah, download artifact ZIP terbaru lalu upload dan ekstrak kembali agar dependency production ikut diperbarui.

## Rollback

1. Revert commit bermasalah.
2. Push hasil revert ke `main`.
3. Workflow mengunggah versi kode sebelumnya.

Rollback kode tidak otomatis membatalkan perubahan database. Migrasi destruktif harus memiliki strategi rollback terpisah.
