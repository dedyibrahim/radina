# Identitas ornamen template

Setiap template tetap memakai nama, palet, foto, layout dan data CMS yang sudah ada. Sistem dekorasi sekarang memakai pasangan motif yang dikurasi serta penempatan asimetris, bukan menambah rangkaian bunga yang sama ke semua kategori.

## Arah visual

`frontend/src/templates/shared/templateArtDirection.js` menetapkan 111 kombinasi eksplisit untuk katalog klasik/studio dan Atelier. Setiap satu dari 55 template Atelier memiliki kombinasi motif utama, aksen, penempatan dan layout yang berbeda. Dunia sinematik khusus serta tema ulang tahun karakter mempertahankan renderer dan ilustrasinya sendiri; template tambahan mewarisi pilihan motif yang sesuai dengan profilnya.

| Karakter | Contoh motif |
| --- | --- |
| Romantic | Mawar tunggal, peony, magnolia, camellia atau sakura; pita atau kupu-kupu sebagai aksen |
| Luxury | Satin, chandelier, kristal, mutiara, bingkai emas |
| Minimalist / Modern | Orbit, prisma, garis arsitektur, mesh dan geometri |
| Nusantara | Ukiran, kawung, songket, kolom pendopo |
| Garden | Pakis, olive, eucalyptus, vine, rumput dan bunga pilihan |
| Islamic | Mihrab, lentera, bulan sabit, arabesque |
| Cinematic | Cahaya, prisma, bintang atau lipatan kain |
| Vintage | Segel lilin, pena bulu, kartu pos, amplop dan vinyl |
| Destination | Kerang, karang, ombak, monstera dan daun palem |
| Creative | Balon, pita, kupu-kupu dan confetti |

Tujuh komposisi tersedia: crest, margin, vertical, orbit, canopy, drape dan horizon. Motif ditempatkan menurut bentuknya; tidak dibalik dengan `scaleX(-1)`/`scaleY(-1)`. Cover/hero Atelier menampilkan dua motif berbeda, sementara setiap bagian isi hanya memiliki satu aksen kecil. Floral `FlowerSpray` dipakai untuk motif utama yang memang berupa bunga, dengan satu bunga utama dan beberapa daun. Layer atmosfer bersama tidak menumpuk motif tambahan di atas ornamen Atelier.

Partikel juga mengikuti bahan: geometri untuk Modern, bintang untuk Islamic/Celestial, kertas untuk Vintage, gelembung untuk pantai, daun untuk botanical, dan confetti untuk tema pesta. Kategori lain tidak mewarisi hujan kelopak generik. Render tetap berhenti di luar viewport, saat tab tidak aktif, saat animasi dimatikan, atau mengikuti reduced motion/mode ringan.

## Aset dan katalog

Tiga belas aset SVG baru memperluas perpustakaan ornamen native di `frontend/src/assets/wedding/ornaments/`. File SVG tetap ringan dan mengikuti warna asli template melalui CSS mask; tidak memerlukan dependency tambahan atau generator gambar.

111 cover katalog dipotret dari renderer aplikasi di `frontend/public/images/templates/previews/`. `TemplateResource` memilih screenshot ini untuk jalur thumbnail katalog bawaan. Jalur gambar custom admin dan cover dunia sinematik tetap dipakai sebagaimana tersimpan. Harga, status, ID template, pesanan, undangan dan lisensi tidak ditulis ulang.

## Validasi

```powershell
node scripts/template-visual-test.mjs
npm run build
$env:RADINA_ALL_IDENTITIES='1'
node scripts/template-visual-browser-test.mjs
Remove-Item Env:RADINA_ALL_IDENTITIES
$env:RADINA_EXCLUSIVE_DETAILS='1'
node scripts/template-visual-browser-test.mjs
Remove-Item Env:RADINA_EXCLUSIVE_DETAILS
php artisan test --filter="TemplateCoverTest|TemplateExpansionTest"
```

Registry audit memeriksa 153 template, keberadaan seluruh motif, determinisme, kombinasi Atelier yang unik dan larangan hujan kelopak generik untuk motif non-botanical. Browser audit memeriksa seluruh template pada mobile serta representasi setiap profil pada desktop, galeri, personalisasi RSVP, kesinambungan audio, tombol animasi dan reduced motion. Suite tambahan memeriksa motif Atelier pada ponsel 390/320 px, semua kategori dan tujuh komposisi: elemen benar-benar bergerak dengan perspektif, tetap tegak, tidak berulang di empat sudut, dan berhenti saat dimatikan.

Untuk memperbarui screenshot setelah perubahan artistik:

```powershell
$env:RADINA_CAPTURE_EXCLUSIVE_ONLY='1'
node scripts/template-visual-browser-test.mjs
Remove-Item Env:RADINA_CAPTURE_EXCLUSIVE_ONLY
npm run build
```

Seluruh browser test dan screenshot memakai API fixture lokal, tanpa memesan, mengirim RSVP atau memodifikasi database produksi.
