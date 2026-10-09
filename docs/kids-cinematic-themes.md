# Tema ulang tahun anak sinematik

Empat template baru ditambahkan ke kategori **Kids & Birthday**:

| Key | Nama | Harga awal | Dunia dan gerakan khas |
| --- | --- | --- | --- |
| `anak-unicorn-cinematic` | Unicorn Sky Party | Rp90.000 | Negeri awan pastel, pelangi berlapis, unicorn melayang, kupu-kupu dan bintang |
| `anak-tom-jerry-cinematic` | Tom & Jerry Garden Party | Rp110.000 | Taman rumah, Tom dan Jerry bergerak sendiri, keju melayang dan confetti |
| `anak-doraemon-cinematic` | Doraemon Magic Door | Rp125.000 | Langit biru, Doraemon terbang, pintu ajaib terbuka, baling-baling dan cahaya portal |
| `anak-upin-ipin-cinematic` | Upin & Ipin Kampung Party | Rp100.000 | Halaman kampung, dua karakter bergerak sendiri, daun tertiup angin dan kupu-kupu |

Harga dapat diubah admin. Migrasi hanya memasukkan template yang belum ada, tanpa menulis ulang harga, status, pesanan, undangan pelanggan atau lisensi. Preview bawaan memakai data ulang tahun anak tanpa membuat pesanan demo tambahan. Katalog yang sudah ada tetap tersedia.

## Tampilan dan CMS

`frontend/src/templates/KidsCinematic/` menggunakan CMS, navigasi, musik, galeri, pilihan tanggal/countdown, lokasi, RSVP dan ucapan yang sudah ada. Nama anak, usia, foto opsional, keluarga, acara dan teks tetap berasal dari data undangan. Cover menampilkan karakter lengkap serta badge usia jika foto anak belum diisi.

Setiap bagian memakai latar penuh sampai tepi dengan kamera perspektif dan fase gerak berbeda. Adegan pembuka, bermain, perayaan dan penutup memakai framing serta tempo berbeda. Awan, cahaya, bendera pesta, balon, confetti, bintang dan properti khas bergerak terpisah melalui CSS. Teks, tombol dan formulir tetap stabil. Ini animasi berlapis dari ilustrasi 3D, bukan file video atau model karakter dengan rig skeletal.

Animasi berhenti pada bagian di luar layar, tab tidak aktif, dan ketika tombol animasi dimatikan. Mode ringan mengurangi ornamen; preferensi sistem `prefers-reduced-motion` menampilkan versi diam. Latar memakai `srcset` 640/1024, sprite mempertahankan alpha transparan.

## Aset dan prompt

Delapan ilustrasi dibuat menggunakan **built-in image_gen**, tanpa fallback CLI. Setiap latar dan sprite dibuat melalui permintaan terpisah. Tidak ada karakter atau teks undangan yang dipanggang ke dalam gambar latar.

Hasil yang dipakai aplikasi disimpan di `frontend/public/images/cinematic/kids/`:

- `bg-{unicorn,tom-jerry,doraemon,upin-ipin}-{640,1024}.webp`: delapan ukuran latar.
- `character-{unicorn,tom-jerry,doraemon,upin-ipin}-768.webp`: empat sprite transparan; dua karakter pada atlas Tom–Jerry dan Upin–Ipin diposisikan/di-mask melalui CSS agar masing-masing bisa bergerak sendiri.
- `preview-{unicorn,tom-jerry,doraemon,upin-ipin}.webp`: empat thumbnail dari screenshot cover aplikasi, bukan mockup.

Prompt akhir seluruh aset tersimpan dalam [kids-cinematic-image-prompts.json](kids-cinematic-image-prompts.json). Salinan PNG asli di workspace tersedia di `test-results/kids-cinematic-source/` (diabaikan Git); output produksi adalah WebP di atas. Resize/encoding menggunakan Sharp sementara di `test-results/kids-asset-tools/`, tanpa menambahkan dependensi aplikasi.

## Pengujian

```powershell
node scripts/template-visual-test.mjs
$env:RADINA_KIDS_CINEMATIC='1'
node scripts/template-visual-browser-test.mjs
php artisan test --filter=InvitationEventTest
npm run build
```

Browser test memakai API fixture lokal. Memeriksa empat tema pada ponsel 390px, ponsel sempit 320px, tablet, desktop, perangkat ringan dan reduced motion; seluruh 14 bagian yang diaktifkan, gambar penuh sampai tepi selama gerakan kamera, penghentian animasi di luar layar, tombol animasi, musik setelah gesture, galeri dan pengiriman RSVP. Screenshot tersimpan di `test-results/template-visuals/kids-*`.

Backend test memakai `radina_wedding_test` saja; mencakup katalog/preview ulang tahun, pemesanan, data usia, migrasi berulang serta pelestarian harga admin, pesanan, undangan, demo dan lisensi. Deploy mengikuti pipeline yang sudah ada; migrasi baru tidak menghapus template saat rollback.

Validasi lokal: registry 153 template lulus; build produksi lulus; `InvitationEventTest` lulus 11 test / 324 assertion; pemeriksaan browser mencakup 24 kombinasi tema/perangkat dan 336 adegan, ditambah empat preview katalog dan empat undangan dengan foto, nama panjang serta usia khusus. Smoke tambahan pada build akhir (`RADINA_KIDS_SMOKE=1`) memeriksa sambungan antarbagian tanpa garis kosong.
