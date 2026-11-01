<script setup>
import { computed, onMounted, ref } from 'vue'
import {
    ArrowDownToLine,
    ArrowUpRight,
    BookOpen,
    Check,
    CheckCheck,
    ChevronRight,
    FileText,
    Layers,
    ListChecks,
    Monitor,
    MoveHorizontal,
    Palette,
    ShieldCheck,
    Wifi,
    MessageCircle,
} from 'lucide-vue-next'
import { useSeo } from '../../composables/useSeo'
import { usePlatformStore } from '../../stores/platform'
import { whatsappLink } from '../../services/whatsapp'

const platform = usePlatformStore()
const release = ref(null)
const error = ref('')
const loading = ref(false)
const contact = computed(() =>
    whatsappLink(
        platform.settings.whatsapp_number || '6287724170145',
        'Halo Radina, saya tertarik dengan SIGANDI untuk merapikan akta di desktop dan Microsoft Word. Boleh dibantu informasi lisensi dan aktivasinya?',
    ),
)
const size = (bytes) =>
    `${(Number(bytes) / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`
async function loadRelease() {
    loading.value = true
    error.value = ''
    try {
        const response = await fetch('/sigandi/release', {
            headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error('release')
        const data = await response.json()
        if (!data.version || !data.files?.installer?.bytes || !data.files?.guide?.bytes)
            throw new Error('release')
        release.value = data
    } catch {
        error.value = 'Informasi unduhan belum dapat dimuat. Coba lagi atau hubungi kami.'
    } finally {
        loading.value = false
    }
}
onMounted(loadRelease)
useSeo(() => ({
    title: 'SIGANDI - Rapikan Garis Akta di Desktop & Word | Radina',
    description:
        'Rapikan garis vertikal, pengisi ---- dan judul tengah akta. Unduh SIGANDI untuk Windows, add-in Microsoft Word, dan panduan pengguna.',
    image: '/images/sigandi/sigandi-preview.svg',
}))
const features = [
    {
        icon: Layers,
        title: 'Garis mengikuti paragraf',
        body: 'Rapikan garis vertikal pada isi akta, termasuk paragraf menjorok dan daftar bernomor.',
    },
    {
        icon: MoveHorizontal,
        title: 'Judul tetap di tengah',
        body: 'Isi ruang kiri dan kanan judul bagian dengan strip hitam, tanpa menimpa kata-katanya.',
    },
    {
        icon: Palette,
        title: 'Detail dalam kendali Anda',
        body: 'Atur warna garis vertikal, ketebalan, serta penutup biasa atau bersilangan. Strip mendatar tetap hitam.',
    },
    {
        icon: FileText,
        title: 'Dari Word ke PDF',
        body: 'Kerjakan langsung melalui tab SIGANDI di Word, atau gunakan desktop untuk mengolah PDF dan menyusun halaman.',
    },
]
const faqs = [
    [
        'Apakah unduhan ini termasuk add-in Word?',
        'Ya. Installer Windows memasang aplikasi desktop dan add-in Word pada akun Windows yang menjalankan installer. Simpan dokumen dan tutup Word sebelum instalasi, kemudian buka kembali Word untuk melihat tab SIGANDI.',
    ],
    [
        'Apakah aplikasi langsung dapat digunakan setelah diunduh?',
        'Fitur SIGANDI memerlukan lisensi aktif. Unduh aplikasinya, pasang, lalu aktivasi menggunakan key yang sah. Hubungi Radina untuk informasi lisensi; mengunduh installer tidak otomatis memberikan lisensi.',
    ],
    [
        'Apakah saya perlu internet?',
        'Ya. Aktivasi dan setiap tindakan berlisensi memerlukan pemeriksaan server. Jika lisensi dihapus, dicabut, kedaluwarsa, atau server tidak dapat dihubungi, fitur berlisensi tidak dijalankan. Dokumen dan garis yang sudah tersimpan tetap ada.',
    ],
    [
        'Versi Word apa yang didukung?',
        'Add-in ditujukan untuk Microsoft Word desktop di Windows dengan VBA dan kebijakan macro yang mengizinkan add-in. Word web serta Word mobile tidak didukung. Installer tidak mengubah pengaturan keamanan Office.',
    ],
    [
        'Apakah garis membuat dokumen tidak dapat diubah?',
        'Garis membantu merapikan dan menutup ruang kosong secara visual. Garis tidak mengunci dokumen atau menjamin dokumen tidak dapat disunting. Periksa seluruh hasil, terutama judul, daftar, footer dan tanda tangan, sebelum digunakan.',
    ],
]
</script>

<template>
    <main class="sigandi-page">
        <section class="sg-hero sg-container">
            <div class="sg-copy">
                <div class="sg-eyebrow"><span></span> SIGANDI BY RADINA.NET</div>
                <h1>Akta lebih rapi.<br />Kerja lebih <em>terarah.</em></h1>
                <p class="sg-lead">
                    Beri perhatian pada isi akta. Biarkan SIGANDI membantu merapikan garis, menutup
                    ruang kosong, dan menjaga tampilan dokumen tetap tertata.
                </p>
                <div class="sg-actions">
                    <a href="#unduh" class="sg-button"
                        ><ArrowDownToLine :size="19" />Unduh SIGANDI</a
                    >
                    <a href="#cara-kerja" class="sg-text-link"
                        >Lihat cara kerja <ArrowUpRight :size="17"
                    /></a>
                </div>
                <div class="sg-compat">
                    <span><Monitor :size="15" />Desktop Windows</span
                    ><span><FileText :size="15" />Add-in Microsoft Word</span>
                </div>
            </div>
            <div class="sg-showcase">
                <div class="sg-app-bar">
                    <span class="sg-app-mark"><ListChecks :size="19" /></span
                    ><strong>SIGANDI</strong><span class="sg-preview-tag">PRATINJAU DOKUMEN</span>
                </div>
                <div class="sg-app-tabs">
                    <span class="active">Dokumen</span><span>Pengaturan Garis</span
                    ><span>Halaman Akta</span>
                </div>
                <div class="sg-document">
                    <span class="sg-document-eyebrow">ILUSTRASI ISI AKTA</span>
                    <div class="sg-title-lines">
                        <span></span
                        ><b
                            >Maksud dan Tujuan<br class="sg-mobile-break" />
                            serta Kegiatan Usaha</b
                        ><span></span>
                    </div>
                    <div class="sg-title-lines sg-pasal">
                        <span></span><b>Pasal 3</b><span></span>
                    </div>
                    <div class="sg-demo-body">
                        <p>Perseroan menjalankan kegiatan usaha <i></i></p>
                        <p>sesuai dengan ketentuan yang berlaku. <i></i></p>
                        <p>Para pihak menyatakan persetujuannya. <i></i></p>
                    </div>
                    <div class="sg-demo-indent">
                        <p>
                            1. <span>Kegiatan usaha dilaksanakan <i></i></span>
                        </p>
                        <p>
                            <span>berdasarkan kesepakatan para pihak. <i></i></span>
                        </p>
                    </div>
                    <div class="sg-signature">
                        Notaris di Kota Contoh<br /><span>( NAMA NOTARIS )</span>
                    </div>
                </div>
                <div class="sg-preview-note">
                    <CheckCheck :size="17" /><span
                        >Strip hitam. Judul di tengah. Paragraf tertata.</span
                    >
                </div>
            </div>
        </section>

        <section class="sg-proof-strip" aria-label="Alur penggunaan">
            <div class="sg-container">
                <span><Check :size="17" />Satu installer, desktop dan Word</span
                ><span><Check :size="17" />Pengaturan garis yang fleksibel</span
                ><span><Check :size="17" />Panduan langkah demi langkah</span>
            </div>
        </section>

        <section class="sg-section sg-container" id="fitur">
            <div class="sg-section-heading">
                <div>
                    <p class="sg-eyebrow">DETAIL KECIL, HASIL LEBIH TERTATA</p>
                    <h2>Ruang kosong rapi.<br />Isi tetap menjadi fokus.</h2>
                </div>
                <p>
                    Dirancang untuk membantu alur kerja penyusunan akta, dari pemeriksaan paragraf
                    sampai hasil PDF yang siap Anda tinjau.
                </p>
            </div>
            <div class="sg-feature-grid">
                <article v-for="feature in features" :key="feature.title">
                    <span class="sg-feature-icon"><component :is="feature.icon" :size="25" /></span>
                    <h3>{{ feature.title }}</h3>
                    <p>{{ feature.body }}</p>
                </article>
            </div>
        </section>

        <section class="sg-workflow" id="cara-kerja">
            <div class="sg-container">
                <p class="sg-eyebrow">DARI SUMBER SAMPAI HASIL AKHIR</p>
                <h2>Mulai sederhana.<br /><em>Rapikan dengan kendali.</em></h2>
                <div class="sg-steps">
                    <article>
                        <span>01</span>
                        <h3>Pasang & aktivasi</h3>
                        <p>Unduh installer, tutup Word, lalu pasang dan aktivasi lisensi Anda.</p>
                    </article>
                    <article>
                        <span>02</span>
                        <h3>Tandai & buat garis</h3>
                        <p>
                            Di Word, tandai isi akta. Di desktop, buka sumber lalu pilih pengaturan
                            garis.
                        </p>
                    </article>
                    <article>
                        <span>03</span>
                        <h3>Periksa & simpan</h3>
                        <p>
                            Tinjau semua halaman, footer dan tanda tangan. Perbarui garis setelah
                            mengedit, lalu simpan hasilnya.
                        </p>
                    </article>
                </div>
            </div>
        </section>

        <section class="sg-section sg-container sg-download-section" id="unduh">
            <div class="sg-section-heading">
                <div>
                    <p class="sg-eyebrow">SIAP UNTUK ALUR KERJA ANDA</p>
                    <h2>Unduh. Pasang.<br />Mulai merapikan.</h2>
                </div>
                <p>
                    Installer dan panduan resmi SIGANDI. Gunakan versi terbaru di setiap komputer
                    agar fitur dan aturan lisensinya tetap sesuai.
                </p>
            </div>
            <div v-if="error" class="sg-release-error" role="alert">
                {{ error }}
                <button @click="loadRelease" :disabled="loading">
                    {{ loading ? 'Memuat…' : 'Coba lagi' }}
                </button>
            </div>
            <p v-else-if="!release" class="sg-release-loading" role="status">
                Memuat versi dan informasi unduhan…
            </p>
            <div v-if="release" class="sg-download-grid">
                <article class="sg-installer-card">
                    <div class="sg-download-top">
                        <Monitor :size="28" /><span>VERSI {{ release.version }}</span>
                    </div>
                    <h3>SIGANDI untuk Windows</h3>
                    <p>
                        Aplikasi desktop dan add-in Word dalam satu installer. Siapkan dokumen Anda,
                        lalu mulai dari sumber yang bersih.
                    </p>
                    <ul>
                        <li><Check :size="16" />Windows 64-bit</li>
                        <li>
                            <Check :size="16" />Word add-in {{ release.word_version }} disertakan
                        </li>
                        <li><Check :size="16" />Lisensi aktif dan internet diperlukan</li>
                    </ul>
                    <a href="/sigandi/download/installer" class="sg-button sg-download-button"
                        ><ArrowDownToLine :size="18" />Unduh Installer EXE
                        <ChevronRight :size="17" /></a
                    ><span class="sg-download-meta"
                        >{{ size(release.files.installer.bytes) }} · Installer resmi
                        Radina.net</span
                    >
                </article>
                <article class="sg-guide-card">
                    <div class="sg-download-top">
                        <BookOpen :size="28" /><span>PANDUAN PDF</span>
                    </div>
                    <h3>Teman langkah pertama.</h3>
                    <p>
                        Pelajari instalasi, aktivasi, fitur desktop, add-in Word, margin akta,
                        pengaturan garis, dan solusi kendala.
                    </p>
                    <div class="sg-guide-preview">
                        <FileText :size="36" />
                        <div>
                            <strong>Panduan SIGANDI</strong
                            ><span>{{ release.guide_pages }} halaman · Bahasa Indonesia</span>
                        </div>
                    </div>
                    <a href="/sigandi/download/guide" class="sg-button sg-button-outline"
                        ><ArrowDownToLine :size="18" />Unduh Panduan PDF</a
                    ><span class="sg-download-meta"
                        >{{ size(release.files.guide.bytes) }} · Sesuai versi
                        {{ release.version }}</span
                    >
                </article>
            </div>
            <div class="sg-download-help">
                <ShieldCheck :size="19" />
                <p>
                    Unduhan aplikasi memerlukan aktivasi untuk menjalankan fitur berlisensi.
                    <a :href="contact" target="_blank" rel="noopener noreferrer"
                        >Tanyakan lisensi & aktivasi <ArrowUpRight :size="13"
                    /></a>
                </p>
            </div>
            <details v-if="release" class="sg-checksums">
                <summary>Verifikasi berkas unduhan (SHA-256)</summary>
                <p>
                    Bandingkan hash berkas yang diunduh dengan nilai berikut untuk memeriksa
                    kesesuaian berkas.
                </p>
                <div v-for="file in release.files" :key="file.filename">
                    <b>{{ file.filename }}</b
                    ><code>{{ file.sha256 }}</code>
                </div>
            </details>
        </section>

        <section class="sg-faq sg-container">
            <div>
                <p class="sg-eyebrow">SEBELUM ANDA MULAI</p>
                <h2>Hal yang mungkin<br />Anda tanyakan.</h2>
                <p class="sg-faq-intro">
                    <Wifi :size="18" /> Aktivasi dan fitur berlisensi memerlukan koneksi ke server.
                </p>
            </div>
            <div class="sg-faq-items">
                <details v-for="[question, answer] in faqs" :key="question">
                    <summary>{{ question }}</summary>
                    <p>{{ answer }}</p>
                </details>
            </div>
        </section>
        <section class="sg-contact sg-container">
            <div>
                <p class="sg-eyebrow">ADA YANG INGIN DIDISKUSIKAN?</p>
                <h2>Kami bantu langkah pertama Anda.</h2>
                <p>Konsultasikan penggunaan dan kebutuhan lisensi SIGANDI bersama Radina.</p>
            </div>
            <a :href="contact" target="_blank" rel="noopener noreferrer" class="sg-button"
                ><MessageCircle :size="19" />Hubungi Radina <ArrowUpRight :size="17"
            /></a>
        </section>
    </main>
</template>

<style scoped>
.sigandi-page {
    --sg-green: #137956;
    --sg-dark: #123f31;
    --sg-muted: #586f63;
    --sg-pale: #edf5f0;
    color: #203e31;
    background: #fcfdfb;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.6;
    overflow: hidden;
}
.sg-container {
    max-width: 1240px;
    margin: auto;
    padding-left: 32px;
    padding-right: 32px;
}
.sg-eyebrow {
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 1.8px;
    color: var(--sg-green);
    margin: 0 0 22px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.sg-eyebrow > span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #38956a;
}
.sg-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    padding-top: 86px;
    padding-bottom: 76px;
    align-items: center;
}
.sg-copy h1 {
    font-size: clamp(40px, 4.1vw, 59px);
    line-height: 1.12;
    font-weight: 650;
    letter-spacing: -2.3px;
    margin: 0 0 27px;
    font-family: Georgia, serif;
}
.sg-copy h1 em,
.sg-workflow h2 em {
    font-weight: 400;
    color: #218261;
}
.sg-lead {
    font-size: 16px;
    line-height: 1.85;
    color: var(--sg-muted);
    max-width: 490px;
    margin: 0 0 30px;
}
.sg-actions {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
}
.sg-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px 22px;
    background: var(--sg-green);
    color: white !important;
    font-weight: 700;
    font-size: 13px;
    text-decoration: none !important;
    border: 1px solid var(--sg-green);
    border-radius: 7px;
    transition:
        background 0.2s,
        transform 0.2s;
    min-height: 50px;
}
.sg-button:hover {
    background: #105d44;
    transform: translateY(-1px);
}
.sg-text-link {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: var(--sg-dark);
    font-weight: 700;
}
.sg-compat {
    display: flex;
    gap: 22px;
    flex-wrap: wrap;
    margin-top: 27px;
    font-size: 11px;
    color: var(--sg-muted);
}
.sg-compat span {
    display: flex;
    align-items: center;
    gap: 7px;
}
.sg-showcase {
    background: #eaf3ed;
    padding: 14px;
    border: 1px solid #d8e7dd;
    border-radius: 16px;
    box-shadow: 0 22px 60px #123f3110;
    transform: rotate(1deg);
}
.sg-app-bar {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 13px 16px;
    background: var(--sg-dark);
    color: white;
    border-radius: 8px 8px 0 0;
    font-size: 14px;
}
.sg-app-mark {
    display: grid;
    place-items: center;
    background: #1f956a;
    border-radius: 6px;
    padding: 5px;
}
.sg-preview-tag {
    margin-left: auto;
    font-size: 7px;
    letter-spacing: 1px;
    color: #b9d8c8;
}
.sg-app-tabs {
    background: #fff;
    padding: 9px 15px;
    display: flex;
    gap: 20px;
    font-size: 9px;
    color: #789081;
}
.sg-app-tabs .active {
    color: #137956;
    font-weight: bold;
}
.sg-document {
    margin: 16px 15px 0;
    background: white;
    padding: 28px 24px 23px;
    border: 1px solid #dfe9e2;
    box-shadow: 0 5px 12px #123f3108;
    font-size: 10px;
    position: relative;
}
.sg-document:before {
    content: '';
    position: absolute;
    left: 20px;
    top: 67px;
    bottom: 111px;
    border-left: 1px solid #d63d39;
}
.sg-document-eyebrow {
    font-size: 7px;
    letter-spacing: 1.4px;
    color: #8b9b91;
    display: block;
    text-align: center;
    margin-bottom: 22px;
}
.sg-title-lines {
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    line-height: 1.5;
    color: #121c16;
    font-size: 9px;
}
.sg-title-lines span {
    flex: 1;
    border-top: 2px dashed #181f1b;
    min-width: 12px;
}
.sg-pasal {
    margin: 17px 0 21px;
    font-size: 11px;
}
.sg-demo-body p,
.sg-demo-indent p {
    display: flex;
    gap: 5px;
    align-items: center;
    margin: 0 0 13px;
    font-size: 9px;
    white-space: nowrap;
}
.sg-demo-body i,
.sg-demo-indent i {
    flex: 1;
    min-width: 7px;
    border-top: 1px dashed #131d17;
}
.sg-demo-indent {
    margin-left: 17px;
    border-left: 1px solid #d63d39;
    padding-left: 7px;
}
.sg-demo-indent span {
    display: flex;
    gap: 4px;
    align-items: center;
    flex: 1;
}
.sg-demo-indent p:last-child {
    margin-left: 11px;
}
.sg-signature {
    text-align: right;
    font-size: 8px;
    color: #687c6f;
    margin-top: 23px;
    padding-right: 20px;
}
.sg-signature span {
    display: block;
    margin-top: 26px;
    font-weight: 700;
    font-size: 7px;
}
.sg-preview-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 10px;
    color: #227251;
    margin: 16px 0 2px;
}
.sg-mobile-break {
    display: none;
}
.sg-proof-strip {
    background: var(--sg-dark);
    color: #dcece2;
}
.sg-proof-strip .sg-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
}
.sg-proof-strip span {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
}
.sg-proof-strip svg {
    color: #90c8a9;
    flex-shrink: 0;
}
.sg-section {
    padding-top: 86px;
    padding-bottom: 86px;
    scroll-margin-top: 100px;
}
.sg-section-heading {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 90px;
    align-items: end;
    margin-bottom: 38px;
}
.sg-section h2,
.sg-workflow h2,
.sg-faq h2,
.sg-contact h2 {
    font:
        500 36px/1.2 Georgia,
        serif;
    letter-spacing: -0.8px;
    margin: 0;
}
.sg-section-heading > p {
    font-size: 14px;
    color: var(--sg-muted);
    margin: 0;
    max-width: 450px;
    line-height: 1.85;
}
.sg-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
}
.sg-feature-grid article {
    background: #fff;
    border: 1px solid #dfe8e1;
    padding: 28px 23px;
    border-radius: 10px;
}
.sg-feature-icon {
    background: #eff6f1;
    display: inline-grid;
    place-items: center;
    color: var(--sg-green);
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 22px;
}
.sg-feature-grid h3 {
    font-size: 15px;
    line-height: 1.4;
    margin: 0 0 13px;
}
.sg-feature-grid p {
    font-size: 12px;
    line-height: 1.9;
    color: var(--sg-muted);
    margin: 0;
}
.sg-workflow {
    background: #edf4ee;
    padding: 65px 0;
    scroll-margin-top: 90px;
}
.sg-workflow h2 {
    font-size: 39px;
}
.sg-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 54px;
    margin-top: 38px;
}
.sg-steps article > span {
    font:
        400 29px Georgia,
        serif;
    color: #6c947d;
    border-bottom: 1px solid #c9dccd;
    padding-bottom: 12px;
    display: block;
}
.sg-steps h3 {
    font-size: 16px;
    margin: 20px 0 10px;
}
.sg-steps p {
    font-size: 13px;
    color: var(--sg-muted);
    line-height: 1.9;
    margin: 0;
}
.sg-download-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 24px;
}
.sg-download-grid article {
    border-radius: 12px;
    padding: 34px;
    display: flex;
    flex-direction: column;
}
.sg-installer-card {
    background: var(--sg-dark);
    color: white;
}
.sg-guide-card {
    background: #f1f5ef;
    border: 1px solid #dfe7dd;
}
.sg-download-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
}
.sg-download-top span {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.4px;
}
.sg-installer-card .sg-download-top {
    color: #a8d9bd;
}
.sg-guide-card .sg-download-top {
    color: #4d7b60;
}
.sg-download-grid h3 {
    font:
        400 27px/1.25 Georgia,
        serif;
    letter-spacing: -0.4px;
    margin: 0 0 15px;
}
.sg-download-grid article > p {
    font-size: 13px;
    line-height: 1.9;
    margin: 0 0 22px;
    max-width: 410px;
}
.sg-installer-card > p {
    color: #c2d6c9;
}
.sg-guide-card > p {
    color: var(--sg-muted);
}
.sg-installer-card ul {
    padding: 0;
    margin: 0 0 27px;
    list-style: none;
    font-size: 12px;
}
.sg-installer-card li {
    display: flex;
    gap: 9px;
    align-items: center;
    margin: 9px 0;
}
.sg-installer-card li svg {
    color: #91d8b1;
}
.sg-download-button {
    background: #e3f0d6;
    border-color: #e3f0d6;
    color: var(--sg-dark) !important;
    margin-top: auto;
}
.sg-download-button:hover {
    background: #d1e5c1;
}
.sg-download-button svg:last-child {
    margin-left: auto;
}
.sg-download-meta {
    display: block;
    font-size: 10px;
    margin-top: 13px;
    text-align: center;
    opacity: 0.8;
}
.sg-guide-preview {
    display: flex;
    gap: 15px;
    align-items: center;
    background: #fff;
    border: 1px solid #dee6da;
    padding: 22px;
    margin: 6px 0 28px;
    border-radius: 6px;
    color: #32614a;
}
.sg-guide-preview strong {
    display: block;
    font-size: 14px;
}
.sg-guide-preview span {
    display: block;
    font-size: 10px;
    margin-top: 3px;
    color: var(--sg-muted);
}
.sg-button-outline {
    background: transparent;
    color: var(--sg-dark) !important;
    border-color: #c2d2c2;
    margin-top: auto;
}
.sg-button-outline:hover {
    background: #e3ecdf;
}
.sg-download-help {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 23px 0;
    color: #5b7463;
}
.sg-download-help > svg {
    margin-top: 2px;
    flex-shrink: 0;
}
.sg-download-help p {
    font-size: 11px;
    margin: 0;
    line-height: 1.8;
}
.sg-download-help a {
    color: #176d4f;
    font-weight: 700;
    white-space: nowrap;
}
.sg-download-help a svg {
    vertical-align: middle;
}
.sg-checksums {
    border-top: 1px solid #dfe8e0;
    padding-top: 13px;
    color: var(--sg-muted);
    font-size: 11px;
}
.sg-checksums summary {
    cursor: pointer;
}
.sg-checksums p {
    margin-top: 15px;
}
.sg-checksums code {
    display: block;
    overflow-wrap: anywhere;
    font-size: 10px;
    padding: 8px 0;
}
.sg-checksums div {
    margin-top: 14px;
}
.sg-release-error {
    padding: 20px;
    background: #fff3e2;
    border: 1px solid #dfc69f;
    border-radius: 8px;
    font-size: 13px;
}
.sg-release-error button {
    background: transparent;
    border: 0;
    color: #176d4f;
    text-decoration: underline;
    cursor: pointer;
    font-weight: bold;
}
.sg-release-loading {
    font-size: 13px;
    color: #64786b;
}
.sg-faq {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 100px;
    padding-bottom: 85px;
    padding-top: 10px;
}
.sg-faq h2 {
    font-size: 33px;
}
.sg-faq-intro {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    line-height: 1.9;
    color: var(--sg-muted);
    max-width: 290px;
    margin-top: 22px;
}
.sg-faq-intro svg {
    flex-shrink: 0;
    margin-top: 3px;
}
.sg-faq-items details {
    border-top: 1px solid #d6e2d9;
    padding: 18px 0;
}
.sg-faq-items details:last-child {
    border-bottom: 1px solid #d6e2d9;
}
.sg-faq-items summary {
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    line-height: 1.6;
    padding-right: 10px;
}
.sg-faq-items p {
    font-size: 12px;
    color: var(--sg-muted);
    line-height: 1.9;
    margin: 14px 0 0;
}
.sg-contact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    padding-top: 45px;
    padding-bottom: 45px;
    background: #edf4ee;
    border: 1px solid #dfe9e0;
    border-radius: 12px;
    margin-bottom: 80px;
}
.sg-contact h2 {
    font-size: 28px;
}
.sg-contact p:not(.sg-eyebrow) {
    font-size: 12px;
    color: var(--sg-muted);
    margin: 15px 0 0;
}
.sg-contact .sg-eyebrow {
    margin-bottom: 14px;
    font-size: 9px;
}
.sg-contact .sg-button {
    flex-shrink: 0;
}
a:focus-visible,
button:focus-visible,
summary:focus-visible {
    outline: 3px solid #7db28d;
    outline-offset: 4px;
}
@media (min-width: 1400px) {
    .sg-hero {
        gap: 85px;
    }
    .sg-document {
        padding: 32px 28px;
    }
    .sg-title-lines {
        font-size: 10px;
    }
    .sg-document:before {
        top: 71px;
        left: 24px;
    }
}
@media (max-width: 1050px) {
    .sg-hero {
        gap: 28px;
        padding-top: 55px;
    }
    .sg-copy h1 {
        font-size: 45px;
    }
    .sg-document {
        margin: 12px 0 0;
        padding: 24px 15px;
    }
    .sg-document:before {
        left: 11px;
        top: 64px;
    }
    .sg-title-lines {
        font-size: 8px;
        gap: 3px;
    }
    .sg-preview-tag {
        font-size: 6px;
    }
    .sg-feature-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .sg-section-heading {
        gap: 30px;
    }
    .sg-faq {
        gap: 40px;
    }
    .sg-contact {
        margin-left: 25px;
        margin-right: 25px;
    }
}
@media (max-width: 760px) {
    .sg-container {
        padding-left: 22px;
        padding-right: 22px;
    }
    .sg-hero {
        grid-template-columns: 1fr;
        padding-top: 43px;
        padding-bottom: 42px;
        gap: 38px;
    }
    .sg-copy h1 {
        font-size: 46px;
        letter-spacing: -1.7px;
    }
    .sg-eyebrow {
        font-size: 9px;
    }
    .sg-lead {
        font-size: 14px;
    }
    .sg-compat {
        gap: 18px;
    }
    .sg-showcase {
        max-width: 500px;
        width: 100%;
        justify-self: center;
        transform: none;
    }
    .sg-document {
        padding: 26px 18px;
    }
    .sg-document:before {
        left: 14px;
        top: 65px;
    }
    .sg-title-lines {
        font-size: 9px;
    }
    .sg-preview-tag {
        font-size: 7px;
    }
    .sg-proof-strip .sg-container {
        flex-direction: column;
        gap: 12px;
        padding-top: 23px;
        padding-bottom: 23px;
    }
    .sg-section {
        padding-top: 55px;
        padding-bottom: 55px;
    }
    .sg-section-heading {
        grid-template-columns: 1fr;
        gap: 20px;
        margin-bottom: 28px;
    }
    .sg-section h2,
    .sg-workflow h2 {
        font-size: 33px;
    }
    .sg-feature-grid {
        gap: 12px;
    }
    .sg-feature-grid article {
        padding: 22px 17px;
    }
    .sg-feature-grid h3 {
        font-size: 14px;
    }
    .sg-feature-grid p {
        font-size: 11px;
    }
    .sg-workflow {
        padding: 44px 0;
    }
    .sg-steps {
        grid-template-columns: 1fr;
        gap: 25px;
        margin-top: 30px;
    }
    .sg-steps article {
        display: grid;
        grid-template-columns: 44px 1fr;
        column-gap: 16px;
    }
    .sg-steps article > span {
        grid-row: span 2;
        border: 0;
    }
    .sg-steps h3 {
        margin: 0 0 7px;
        font-size: 15px;
    }
    .sg-download-grid {
        grid-template-columns: 1fr;
    }
    .sg-download-grid article {
        padding: 27px;
    }
    .sg-download-help a {
        white-space: normal;
    }
    .sg-faq {
        grid-template-columns: 1fr;
        gap: 25px;
        padding-top: 0;
        padding-bottom: 50px;
    }
    .sg-faq-intro {
        max-width: none;
    }
    .sg-contact {
        flex-direction: column;
        align-items: flex-start;
        padding-top: 29px;
        padding-bottom: 29px;
        margin: 0 18px 45px;
    }
    .sg-contact .sg-button {
        width: 100%;
    }
    .sg-contact h2 {
        font-size: 27px;
    }
    .sg-preview-note {
        font-size: 9px;
    }
    .sg-signature {
        font-size: 7px;
    }
    .sg-actions {
        gap: 18px;
    }
    .sg-app-tabs {
        gap: 18px;
    }
    .sg-text-link {
        font-size: 12px;
    }
}
@media (max-width: 370px) {
    .sg-copy h1 {
        font-size: 40px;
    }
    .sg-title-lines {
        font-size: 8px;
    }
    .sg-demo-body p,
    .sg-demo-indent p {
        font-size: 8px;
    }
    .sg-document {
        padding-left: 12px;
        padding-right: 12px;
    }
    .sg-document:before {
        left: 8px;
    }
    .sg-feature-grid {
        grid-template-columns: 1fr;
    }
    .sg-preview-tag {
        display: none;
    }
}
</style>
