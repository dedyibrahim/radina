# Paket, dokumen, tamu, statistik, dan pengingat

## Harga paket

Menu admin **Paket & Tambahan** menyediakan Basic, Premium, dan VIP dalam keadaan nonaktif dengan harga kosong. Harga template yang sekarang tetap berlaku. Isi harga, deskripsi, fitur, serta masa aktif sebelum mengaktifkan paket. Masa aktif kosong berarti tanpa batas.

- **Tambahan atas harga template**: harga template + harga paket + layanan tambahan pilihan pelanggan.
- **Harga paket termasuk template**: harga paket + layanan tambahan pilihan pelanggan.

Harga dihitung ulang di server saat pemesanan. Jika ringkasan pelanggan sudah kedaluwarsa, pemesanan meminta pelanggan memeriksa harga kembali. Rincian pesanan menyimpan harga saat pemesanan; perubahan harga berikutnya tidak mengubah pesanan tersebut. Paket/add-on dapat dinonaktifkan untuk pesanan berikutnya.

Masa aktif dihitung sejak undangan pertama dipublish dan tidak dimulai ulang saat publish berikutnya. Undangan lama tetap tanpa batas masa aktif. Setelah kedaluwarsa, undangan publik, RSVP, QR publik, dan check-in ditutup, sedangkan admin masih dapat melihat pesanan dan statistik.

## Invoice dan kwitansi PDF

Tombol download terdapat pada halaman pembayaran/cek pesanan, detail pesanan admin, dan tab **Dokumen & Pengingat** portal pelanggan. Invoice tersedia setelah pemesanan; kwitansi tersedia setelah admin mengonfirmasi pembayaran. Dokumen menyimpan rincian saat pertama diterbitkan. Pesanan lama memakai total tersimpan, bukan harga template terbaru.

Dokumen pelanggan memerlukan nomor pesanan dan WhatsApp pemesan, atau tautan portal pelanggan yang masih berlaku. PDF tidak disimpan pada direktori publik. Dokumen admin memerlukan sesi admin. Renderer PDF menolak sumber remote, JavaScript, dan PHP. Rekening berasal dari pengaturan pembayaran admin.

## QR dan check-in

1. Impor daftar tamu menggunakan fitur Impor / Ekspor yang sudah tersedia.
2. Buka tab **Statistik & Tamu** untuk mengunduh QR per tamu dan CSV berisi tautan undangan, tautan QR, RSVP, serta kehadiran.
3. Tamu dapat mengunduh QR lewat tombol **QR Kehadiran** pada undangan personal, atau halaman `/tamu/{kode-unik}`.
4. Buka **Check-in QR** untuk acara tersebut. Petugas dapat memakai kamera, foto QR, atau menempel kode/tautan QR.
5. Periksa nama/alamat, isi jumlah orang yang tiba, lalu konfirmasi. Pemindaian ulang menampilkan check-in sebelumnya dan tidak menambah hitungan.

Kode acara lain ditolak. Check-in memerlukan admin, pembayaran terkonfirmasi, undangan aktif, serta masa aktif yang belum berakhir. Halaman QR publik hanya menampilkan nama, acara, tanggal, dan tautan personal, tanpa alamat atau kontak pemesan. Kamera memerlukan izin browser dan HTTPS pada perangkat ponsel.

## Statistik

Admin dan portal pelanggan menampilkan kunjungan 7/30/90 hari, pengunjung unik, pembukaan undangan, serta tautan tamu yang dibuka. Identitas pengunjung berupa UUID browser yang di-hash; sistem tidak menyimpan IP mentah untuk analitik. Pengunjung unik adalah perkiraan berdasarkan browser, bukan jumlah orang pasti. Preview dan demo tidak direkam.

RSVP menampilkan jawaban terbaru per tamu; jawaban lama tanpa token dikelompokkan berdasarkan nama. Kehadiran aktual berasal dari check-in dan dihitung terpisah dari estimasi RSVP. Daftar tamu dapat dicari, dipaginasi, diunduh sebagai CSV, dan ditampilkan hanya kepada admin atau pemilik portal.

## Pengingat

Pengingat tampil di dashboard admin, menu **Pengingat**, dan portal pelanggan:

- Pembayaran: 24 jam setelah pemesanan jika belum dikonfirmasi.
- Kelengkapan data: 48 jam setelah pembayaran jika data belum lengkap.
- Persetujuan: 24 jam setelah pratinjau dikirim untuk ditinjau.
- Acara: H-7 dan H-1, pukul 09.00 WIB.
- Masa aktif: tujuh hari dan satu hari sebelum berakhir untuk undangan dengan batas aktif.

Pengingat yang tahapnya sudah selesai terselesaikan otomatis. Pesanan batal dan demo dikecualikan. Admin dapat menunda satu hari atau menandai selesai. Sistem tidak mengirim email atau WhatsApp otomatis.

Pengingat diperbarui ketika dashboard/portal dibuka dan setiap menit selama halaman aktif. Untuk pembaruan di latar belakang, scheduler Laravel menjalankan `radina:reminders` setiap sepuluh menit. Cron hosting opsional:

```cron
* * * * * cd /path/to/public_html/_app && php artisan schedule:run >> /dev/null 2>&1
```

Tanpa cron, pengingat tetap dihitung dari waktu yang dijadwalkan ketika halaman dibuka. Perintah manual: `php artisan radina:reminders`.

## Deployment dan validasi

Migrasi hanya menambah tabel/kolom fitur undangan. File dan tabel lisensi tidak diubah. CI/CD tetap membuat backup lisensi dan memeriksa pelestariannya sebelum dan sesudah migrasi/seeding. Jika Composer berubah, vendor ikut dikirim dengan manifest yang diverifikasi; `.env`, APP_KEY, dan storage production tetap dipertahankan.

Jalankan backend test hanya di `radina_wedding_test`. Browser test yang melakukan pemesanan memakai server terisolasi port 8001:

```powershell
$env:TEST_URL='http://127.0.0.1:8001'
$env:TEST_ADMIN_EMAIL='admin@radina.test'
$env:TEST_ADMIN_PASSWORD='<password admin test>'
npm run test:business
```

Validasi production memakai `TEST_URL=https://radina.net` dan `READ_ONLY_PRODUCTION=1`; mode ini tidak melakukan pemesanan, perubahan harga/konten, pembayaran, check-in, atau penerbitan dokumen.
