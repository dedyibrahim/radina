# Deployment Shared Hosting dengan GitHub Actions

Workflow `.github/workflows/ci-cd.yml` menjalankan test Laravel, build Vite, membuat paket production, lalu mengunggahnya ke shared hosting melalui FTP atau FTPS.

## Persyaratan Hosting

- PHP 8.1 atau lebih baru; PHP 8.2 direkomendasikan.
- MySQL 8 atau MariaDB yang kompatibel.
- Ekstensi PHP: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, dan `xml`.
- Domain harus diarahkan ke folder `public` milik Laravel.
- Terminal atau SSH direkomendasikan untuk migrasi dan cache otomatis.

Contoh struktur hosting:

```text
/home/username/radina/
├── app/
├── bootstrap/
├── public/       <- document root domain
├── storage/
├── vendor/
└── artisan
```

Jangan arahkan domain ke root aplikasi karena `.env`, source code, dan file internal Laravel dapat terekspos.

## GitHub Environment

Di repository GitHub buka:

`Settings > Environments > New environment > production`

Tambahkan secrets berikut pada environment `production`:

| Secret | Keterangan |
| --- | --- |
| `FTP_SERVER` | Host FTP, misalnya `ftp.domain.com` |
| `FTP_USERNAME` | Username FTP |
| `FTP_PASSWORD` | Password FTP |
| `SSH_HOST` | Opsional, host SSH |
| `SSH_USERNAME` | Opsional, username SSH |
| `SSH_PRIVATE_KEY` | Opsional, private key SSH |

Tambahkan variables berikut:

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `FTP_PROTOCOL` | `ftp` atau `ftps` | Protokol server |
| `FTP_SERVER_DIR` | `/radina/` | Folder aplikasi pada koneksi FTP |
| `SSH_PORT` | `22` | Opsional |
| `SSH_APP_DIR` | `/home/username/radina` | Path absolut aplikasi untuk perintah Artisan |

Secrets SSH harus diisi lengkap atau dikosongkan seluruhnya. Jika SSH tersedia, workflow otomatis menjalankan migrasi, membuat storage link, dan membangun cache production.

## Konfigurasi `.env` Production

File `.env` tidak pernah dikirim oleh workflow. Buat file ini langsung di hosting:

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

Buat `APP_KEY` sekali melalui Terminal cPanel:

```bash
cd /home/username/radina
php artisan key:generate
```

Jangan mengganti `APP_KEY` setelah aplikasi digunakan karena session dan data terenkripsi lama tidak dapat dibaca.

## Deployment Pertama

1. Buat database dan user database di cPanel.
2. Buat folder aplikasi, misalnya `/home/username/radina`.
3. Arahkan document root domain ke `/home/username/radina/public`.
4. Buat `.env` production di root aplikasi.
5. Konfigurasikan GitHub Environment dan secrets.
6. Buka tab `Actions`, pilih `CI/CD Shared Hosting`, lalu klik `Run workflow`.

Jika hosting tidak menyediakan SSH, jalankan setelah upload melalui Terminal cPanel:

```bash
cd /home/username/radina
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Pastikan folder berikut dapat ditulis oleh PHP:

```bash
chmod -R 775 storage bootstrap/cache
```

Seeder hanya untuk instalasi awal dan tidak dijalankan otomatis:

```bash
php artisan db:seed --force
```

## Deployment Berikutnya

Setiap push ke branch `main` akan:

1. Menjalankan seluruh test dengan MySQL.
2. Membangun frontend production.
3. Menginstal dependency Composer tanpa paket development.
4. Mengunggah perubahan melalui FTP/FTPS.
5. Menjalankan migrasi dan cache jika SSH dikonfigurasi.

Folder upload pengguna, `.env`, session, cache runtime, dan log tidak akan dihapus oleh proses sinkronisasi FTP.

## Rollback

Workflow tidak mengubah data database sebelum seluruh test berhasil. Untuk rollback kode:

1. Revert commit bermasalah di GitHub.
2. Push hasil revert ke `main`.
3. Workflow akan mengunggah versi kode sebelumnya.

Migrasi database yang bersifat destruktif harus memiliki strategi rollback sendiri dan tidak boleh mengandalkan rollback kode saja.

