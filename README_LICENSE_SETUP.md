# License Server Setup (Laravel + Tailwind)

## 1) Install & run

```powershell
cd "E:\My Project\Website\New folder (3)\license-server"
composer install
npm install
npm run build
php artisan migrate --seed
php artisan serve
```

Default admin:

- Email: `admin@radina.net`
- Password: `Admin@12345`

Login URL: `http://127.0.0.1:8000/login`

## 2) Environment penting

Atur di `.env`:

```env
LICENSE_PRODUCT_NAME="Sistem Garis Akta Notaris Digital"
LICENSE_ACTIVATION_TOKEN=ISI_TOKEN_RAHASIA_SERVER
```

## 3) Endpoint aktivasi online

`POST /api/license/activate`

Header:

- `Content-Type: application/json`
- `X-LICENSE-TOKEN: <LICENSE_ACTIVATION_TOKEN>`

Body JSON:

```json
{
  "license_key": "DST1A-TRIAL-2026A-00001-ABCDE",
  "machine_id": "PC-CLIENT-001",
  "app_version": "1.0.0"
}
```

Jika valid, server mengembalikan:

- `valid: true`
- info lisensi
- jumlah device aktif

Jika tidak valid, server mengembalikan alasan: tidak ditemukan, revoked, expired, atau kuota aktivasi penuh.

## 4) Integrasi ke aplikasi Python (garis_editor.py)

Di folder project Python (`E:\My Project\Website\New folder (3)`), buat file `.env`:

```env
GARIS_LICENSE_API_URL=http://127.0.0.1:8000/api/license/activate
GARIS_LICENSE_API_TOKEN=ISI_TOKEN_RAHASIA_SERVER
GARIS_LICENSE_API_TIMEOUT=12
```

Lalu jalankan:

```powershell
python .\garis_editor.py
```
