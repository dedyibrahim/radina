<script setup>
import { computed } from 'vue'
import { ArrowUpRight, Flower2, Heart, MessageCircle, Palette } from 'lucide-vue-next'
import { usePlatformStore } from '../../stores/platform'
import { whatsappLink } from '../../services/whatsapp'
import { useSeo } from '../../composables/useSeo'
import PaymentBankAccounts from '../../components/PaymentBankAccounts.vue'
const platform = usePlatformStore()
const bouquets = Array.from({ length: 17 }, (_, i) => {
  const number = String(i + 1).padStart(2, '0')
  return { name: `Buket Custom ${number}`, image: `/images/bouquets/buket-${number}.jpg` }
})
const customLink = computed(() => whatsappLink(platform.settings.whatsapp_number,
  'Halo Radina, saya ingin pesan buket custom mulai Rp100.000. Boleh konsultasi desain, isi, warna, dan tanggal yang saya perlukan?'))
function orderLink(bouquet) {
  return whatsappLink(platform.settings.whatsapp_number,
    `Halo Radina, saya tertarik dengan ${bouquet.name}. Referensi foto: ${window.location.origin}${bouquet.image}. Saya ingin diskusi harga dan custom untuk buket ini.`)
}
useSeo(() => ({ title: 'Buket Custom Mulai Rp100.000 | Radina',
  description: 'Buket untuk wisuda, ulang tahun, dan momen istimewa. Mulai Rp100.000, bisa custom. Pesan melalui WhatsApp 081289903664.',
  image: '/images/bouquets/buket-05.jpg' }))
</script>
<template>
  <main class="bouquet-page">
    <section class="bouquet-hero p-container">
      <div class="bouquet-hero-copy">
        <p class="p-eyebrow">RADINA · BUKET & HADIAH</p>
        <h1>Seikat perhatian.<br /><em>Sejuta arti.</em></h1>
        <p>Rayakan wisuda, ulang tahun, dan momen istimewa dengan buket yang dibuat sesuai keinginan Anda.</p>
        <div class="bouquet-start"><span>Harga mulai</span><strong>Rp100.000</strong><small>Bisa custom warna, isi, dan desain.</small></div>
        <div class="bouquet-actions">
          <a :href="customLink" class="p-button" target="_blank" rel="noopener noreferrer"><MessageCircle :size="18" />Pesan via WhatsApp</a>
          <a href="#koleksi-buket" class="text-link">Lihat koleksi <ArrowUpRight :size="16" /></a>
        </div>
        <p class="bouquet-contact">WhatsApp <a :href="customLink" target="_blank" rel="noopener noreferrer">0812 8990 3664</a></p>
      </div>
      <div class="bouquet-hero-image">
        <img src="/images/bouquets/buket-05.jpg" alt="Buket bunga pink dengan boneka wisuda dan pita, salah satu kreasi buket custom" width="960" height="1280" fetchpriority="high" />
        <span><Heart :size="15" />Dibuat untuk momen Anda</span>
      </div>
    </section>
    <section class="bouquet-benefits p-container" aria-label="Keunggulan buket">
      <div><Flower2 :size="24" /><span><b>Untuk berbagai momen</b><small>Wisuda, ulang tahun, dan hadiah spesial.</small></span></div>
      <div><Palette :size="24" /><span><b>Personal sesuai keinginan</b><small>Konsultasikan warna, isi, dan desain.</small></span></div>
      <div><MessageCircle :size="24" /><span><b>Pesan langsung via WhatsApp</b><small>Pilih referensi, lalu diskusikan detailnya.</small></span></div>
    </section>
    <section id="koleksi-buket" class="p-section p-container bouquet-collection">
      <p class="p-eyebrow">PILIH INSPIRASI ANDA</p>
      <h2>Buket dengan <em>sentuhan personal.</em></h2>
      <p class="bouquet-intro">Foto kreasi buket kami untuk inspirasi pesanan Anda. Harga akhir mengikuti desain, isi, dan permintaan custom; konfirmasikan totalnya melalui WhatsApp.</p>
      <div class="bouquet-grid">
        <article v-for="bouquet in bouquets" :key="bouquet.name" class="bouquet-card">
          <a :href="orderLink(bouquet)" target="_blank" rel="noopener noreferrer" :aria-label="`Lihat dan pesan ${bouquet.name} melalui WhatsApp`" class="bouquet-photo-link">
            <img :src="bouquet.image" :alt="`Foto ${bouquet.name} sebagai inspirasi desain pesanan`" width="960" height="1280" loading="lazy" decoding="async" />
            <span>Bisa custom</span>
          </a>
          <div class="bouquet-card-copy">
            <h3>{{ bouquet.name }}</h3>
            <p>Diskusikan desain dan harga sesuai pilihan Anda.</p>
            <a :href="orderLink(bouquet)" target="_blank" rel="noopener noreferrer" class="text-link">Pesan buket ini <ArrowUpRight :size="16" /></a>
          </div>
        </article>
      </div>
    </section>
    <section class="bouquet-payment p-container">
      <p class="p-eyebrow">PEMBAYARAN PESANAN BUKET</p>
      <h2>Siap untuk <em>momen Anda.</em></h2>
      <p>Pilih desain dan sepakati total pesanan melalui WhatsApp terlebih dahulu. Setelah itu, transfer ke salah satu rekening berikut dan kirim bukti pembayaran kepada kami.</p>
      <PaymentBankAccounts />
    </section>
    <section class="bouquet-custom p-container">
      <p class="p-eyebrow">PUNYA IDE SENDIRI?</p>
      <h2>Mari buat buket<br /><em>versi Anda.</em></h2>
      <p>Kirim referensi, warna favorit, pilihan isi, budget, dan tanggal kebutuhan Anda. Kami bantu diskusikan buket yang sesuai.</p>
      <a :href="customLink" target="_blank" rel="noopener noreferrer" class="p-button"><MessageCircle :size="18" />Konsultasi Buket Custom</a>
    </section>
  </main>
</template>
<style scoped>
.bouquet-hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 70px; align-items: center; padding-top: 65px; padding-bottom: 60px; }
.bouquet-hero h1 { font-size: clamp(2.8rem, 5vw, 5rem); line-height: 1.08; }
.bouquet-hero-copy > p:not(.p-eyebrow) { line-height: 1.9; max-width: 430px; margin: 24px 0; color: #7c896b; font-size: 14px; }
.bouquet-start { display: grid; gap: 5px; margin: 30px 0; }
.bouquet-start > span { font-size: 12px; color: #7c896b; }
.bouquet-start strong { font-size: 32px; font-family: Georgia, serif; color: #7b4337; }
.bouquet-start small { font-size: 12px; color: #7c896b; }
.bouquet-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 22px; }
.bouquet-contact a { color: #4b5e42; text-decoration: underline; text-underline-offset: 4px; }
.bouquet-hero-image { position: relative; max-width: 460px; justify-self: end; }
.bouquet-hero-image img { width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: cover; border-radius: 150px 150px 10px 10px; }
.bouquet-hero-image > span { position: absolute; bottom: 22px; left: 20px; right: 20px; display: flex; align-items: center; justify-content: center; gap: 9px; padding: 14px; background: #fffef9ec; color: #4b5e42; border-radius: 6px; font-size: 12px; }
.bouquet-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; border-top: 1px solid #d9dfce; border-bottom: 1px solid #d9dfce; padding-top: 26px; padding-bottom: 26px; }
.bouquet-benefits > div { display: flex; gap: 14px; align-items: center; color: #667859; }
.bouquet-benefits span { display: grid; gap: 8px; }
.bouquet-benefits b { font-size: 13px; font-weight: 500; }
.bouquet-benefits small { font-size: 11px; line-height: 1.6; }
.bouquet-benefits svg { flex-shrink: 0; }
.bouquet-intro { max-width: 650px; color: #7c896b; font-size: 13px; line-height: 1.9; margin: 22px 0 38px; }
.bouquet-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px; }
.bouquet-card { min-width: 0; }
.bouquet-photo-link { position: relative; display: block; overflow: hidden; border-radius: 8px; }
.bouquet-photo-link img { width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: cover; display: block; transition: transform .3s ease; }
.bouquet-photo-link:hover img { transform: scale(1.025); }
.bouquet-photo-link > span { position: absolute; bottom: 15px; left: 15px; background: #fffef9ef; color: #4b5e42; padding: 7px 12px; border-radius: 20px; font-size: 11px; }
.bouquet-card-copy { padding: 18px 0 12px; }
.bouquet-card-copy h3 { font-size: 23px; }
.bouquet-card-copy p { color: #7c896b; font-size: 12px; line-height: 1.7; margin: 12px 0; }
.bouquet-card-copy a { font-size: 12px; }
.bouquet-custom { text-align: center; background: #f1f0e3; padding-top: 60px; padding-bottom: 60px; margin-bottom: 70px; border-radius: 12px; }
.bouquet-custom p:not(.p-eyebrow) { max-width: 520px; margin: 25px auto; color: #7c896b; line-height: 1.9; font-size: 13px; }
.bouquet-custom a { margin: auto; }
.bouquet-payment { max-width: 820px; padding-top: 0; padding-bottom: 65px; }
.bouquet-payment > p:not(.p-eyebrow) { color: #7c896b; font-size: 13px; line-height: 1.9; margin: 22px 0 28px; }
@media (max-width: 900px) {
  .bouquet-hero { gap: 35px; }
  .bouquet-benefits { grid-template-columns: 1fr; gap: 22px; }
  .bouquet-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
}
@media (max-width: 600px) {
  .bouquet-hero { grid-template-columns: 1fr; gap: 30px; padding-top: 35px; }
  .bouquet-hero-image { justify-self: center; max-width: 380px; }
  .bouquet-grid { grid-template-columns: 1fr; gap: 22px; }
  .bouquet-custom { border-radius: 0; }
}
@media (prefers-reduced-motion: reduce) { .bouquet-photo-link img { transition: none; } }
</style>
