# SIGANDI Word 0.4.6 Preview

Disertakan bersama installer SIGANDI 1.4.6 untuk Word desktop Windows. Add-in
dimuat otomatis melalui Startup Word untuk akun pemasang. Simpan dan tutup Word
sebelum instalasi. Kebijakan macro yang sudah berlaku tidak diubah.

## Pola garis

Versi 0.4 menambahkan lisensi bersama desktop, penutup bersilangan/biasa,
empat ukuran penutup dalam pt, pembaruan penutup cepat, Page Setup Word dan
preset margin/kertas kantor per bagian atau seluruh dokumen. Margin awal
mengikuti dokumen; tidak ada angka margin yang diklaim sebagai ketentuan hukum.
Rujukan: [UU 30/2004](https://www.pajak.go.id/id/jabatan-notaris) dan
[UU 2/2014](https://peraturan.bpk.go.id/Details/38565/uu-no-2-tahun-2014).

Lisensi diperiksa melalui executable desktop 1.4.6+ yang didaftarkan installer
di HKCU Software/RadinaNet/SIGANDI DesktopExe. Protokol UTF-16 sementara
hanya berisi status dan identitas terverifikasi, bukan key/API token. Bukti aktivasi
lokal diperiksa tanda tangannya, lalu server wajib menyetujui setiap tindakan
berlisensi. Cache tampilan status bukan izin menjalankan tindakan. Respons gagal,
lisensi terhapus/revoked/expired, dan jaringan putus ditolak. Pemeriksaan memakai
endpoint aktivasi yang sudah ada dan memperbarui last_seen di server. Tidak
mengubah pengaturan Office.

Versi 0.3 mengganti border kiri Word yang terlalu jauh di luar nomor dengan
garis blok tersambung. Baris nomor memiliki garis pendek; baris lanjutan masuk
ke indentasi teks. Setiap halaman isi memiliki pembuka dan penutup miring.
Header/footer dan blok Notaris/PPAT dilewati. Paragraf kosong nyata dalam isi
dapat diberi pengisi `----`; ruang Before/After dan sisa kertas tidak ditebak.

Blok isi akta > Tandai Area Isi > Buat Semua. Tombol satu jenis menjalankan
vertikal (termasuk penutup) atau pengisi horizontal saja. Setelah mengubah teks
atau tata letak, klik **Perbarui Garis**. Posisi tidak diperbarui otomatis saat
mengetik. Hapus dan Undo hanya menangani hasil SIGANDI; teks dan bentuk pengguna
dipertahankan. Border versi 0.2 dipulihkan sebelum dibuat pola baru.

Pengukuran posisi menggunakan Word Print Layout. Nilai indentasi paragraf
menentukan letak rail; ini menghindari posisi caret X yang tidak konsisten
setelah shape dihapus. Jangkar dipilih di dalam paragraf pada halaman target,
karena jangkar tepat di batas paragraf dapat berpindah ke paragraf/halaman
sebelumnya. Jangkar disimpan sebagai Range hidup, bukan indeks tetap: Word
menambahkan posisi karakter untuk setiap objek gambar meski Content.Text tetap
sama. Range menjaga jangkar halaman berikutnya ikut bergeser dengan benar. Garis dibatasi area isi dan berhenti sebelum label tanda tangan.

## Build dan validasi

`python word-addin/build_addin.py` membuat DOTM dengan pyopenvba 6.5.0 dan Pillow.
Kebutuhan ini hanya untuk pembuat; pengguna tidak memerlukan Python atau server.
Fitur berlisensi memerlukan helper desktop; aktivasi memerlukan internet.
Builder memverifikasi sumber VBA di dalam DOTM sama persis.
`build_installer.bat` membangun add-in lalu installer Inno. Sumber installer Word:
`installer_word.iss`. Installer memeriksa Word sudah ditutup, memverifikasi hash
payload, dan mencadangkan preview lama. Tidak menutup dokumen pengguna.

`check_word_geometry.py` menguji indentasi bertingkat, kontinuitas, penutup,
pembaruan berulang, migrasi native border, hapus, Undo, DOCX round trip, teks,
bentuk pengguna serta dua salinan akta 35 dan 10 halaman. Hasil dan PDF sementara:
`tmp/sigandi-word-0.4-geometry`. `check_installer.py` menguji pemasangan dan upgrade
ke folder terisolasi. Build Inno `/DIntegrationTest` memiliki AppId terpisah,
tanpa shortcut/registry uninstall dan menerima `/WORDSTARTUPDIR=...`; hanya build
uji melewati pemeriksaan Word terbuka.

Cakupan: paragraf isi utama satu kolom. Tabel, textbox, mirror margins, gambar
inline dan multikolom dilewati. Seluruh fitur desktop belum tersedia di Word.
Garis bukan penguncian dokumen. Dialog ribbon belum diperiksa melalui otomasi UI;
mesin, callback, ekspor dan autoload diuji melalui API Word. Panduan: PANDUAN.txt.

`check_word_settings.py` memeriksa lisensi bersama yang sudah aktif (tanpa
membuat lisensi), empat ukuran penutup, dua mode, penutup datar, Undo, perubahan
margin per section/semua section, ukuran kertas khusus, penolakan nilai invalid,
serta teks/footer/bentuk pengguna. Hasil: `tmp/sigandi-word-0.4-settings`.

Versi 0.4.3 mengawali penutup pada baris pertama meski berupa garis pendek
nomor. Dropdown Warna Garis menyimpan pilihan Hitam/Merah/Hijau/Abu-abu dan
mewarnai ketiga jenis garis yang sudah ada, dengan satu langkah Undo.

Versi 0.4.3 memperhitungkan sisi kiri label nomor otomatis, termasuk
roman rata kanan/tengah. GDI mengukur lebar glyph sesuai font nomor.
Ketebalan 0,1-4 pt diterapkan pada garis lama serta pembuatan berikutnya.
Tes `check_numbered_lines.py` membandingkan posisi rail dengan glyph PDF
untuk i./ii./iii. pada tiga jenis perataan serta ketebalan dan Undo.

Optimasi 0.4.3: H disimpan dalam drawing canvas transparan per halaman.
Gunakan solid fill dengan Transparency=1; Fill.Visible=False ternyata
menghasilkan latar putih opak pada ekspor PDF Word. Canvas tetap di
belakang objek lain. Pengaturan warna/tebal menyasar stroke anak, bukan
border canvas. Penghapusan mengenali container H_ maupun garis lama.
Dokumentasi API: https://learn.microsoft.com/en-us/office/vba/api/word.shapes.addcanvas

Template NumberPosition dapat berbeda dari LeftIndent+FirstLineIndent
paragraf yang diberi format langsung. Gunakan posisi efektif paragraf.
Benchmark 7 halaman: 21.33 s menjadi 11.38 s; posisi teks dan footer identik,
perbedaan pembulatan stroke maksimal 0.34 pt pada dua renderer Word.

PEMBARUAN 0.4.6
Jangkar kanvas dibuat pada titik kosong agar tidak menghapus huruf pada dokumen kompatibilitas dan memicu pesan perubahan teks saat proses berjalan. Pemeriksaan perubahan teks tetap aktif.

PEMBARUAN LISENSI 0.4.6 / 1.4.6
Setiap tindakan berlisensi memeriksa server; tidak memakai persetujuan offline atau cache lima menit untuk menjalankan tindakan. Jika server tidak dapat dihubungi, fitur berlisensi diblokir sampai pemeriksaan berhasil. Word dan dokumen lama tetap dapat dibuka.

PEMBARUAN JUDUL DAN WARNA 1.4.6 / 0.4.6
Isi ---- menambahkan pengisi di kiri dan kanan judul bagian rata tengah,
misalnya Maksud dan Tujuan serta Kegiatan Usaha atau Pasal 3, tanpa menimpa
kata-katanya. Di Word, sertakan judul bagian di dalam area isi yang ditandai.
Judul utama, Nomor, footer dan tanda tangan tetap di luar area pemrosesan.
Strip mendatar selalu hitam pada pratinjau, perubahan warna dan hasil PDF.
Pilihan warna hanya berlaku pada garis vertikal beserta penutupnya.
