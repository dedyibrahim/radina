<script setup>
import { eventOptions } from '../../services/invitationEvents'
import { ref, onMounted } from 'vue'
import {
  ArrowUpRight,
  Heart,
  Smartphone,
  Music,
  Camera,
  MapPin,
  MailCheck,
  Gift,
  Check,
  Leaf,
  Sparkles,
} from 'lucide-vue-next'
import { api, formatMoney } from '../../services/api'
import { usePlatformStore } from '../../stores/platform'
import { useSeo } from '../../composables/useSeo'
import TemplateCard from '../../components/TemplateCard.vue'
const templates = ref([]),
  platform = usePlatformStore()
onMounted(async () => {
  try {
    templates.value = (await api.get('/templates', { params: { featured: 1 } })).data.data
  } catch {}
})
useSeo(() => ({
  title: platform.settings.seo_title,
  description: platform.settings.seo_description,
  image: templates.value[0]?.thumbnail,
}))
const features = [
  {
    icon: Smartphone,
    title: 'Indah di setiap layar',
    text: 'Dirancang untuk kenyamanan tamu, terutama saat dibuka dari WhatsApp.',
  },
  {
    icon: Leaf,
    title: 'Personal, seperti cerita Anda',
    text: 'Nama, foto, cerita, dan detail acara disiapkan khusus untuk hari bahagia Anda.',
  },
  {
    icon: Sparkles,
    title: 'Kami bantu sampai siap',
    text: 'Tim kami mengisi konten dan memastikan undangan siap untuk dibagikan.',
  },
]
const faqs = [
  [
    'Bagaimana cara memesan?',
    'Pilih template, isi data pemesan, lalu buat pesanan. Setelah transfer, kirim bukti pembayaran melalui WhatsApp. Admin akan menyiapkan konten undangan Anda.',
  ],
  [
    'Apakah saya perlu mengisi website sendiri?',
    'Tidak. Admin akan membantu mengisi nama, foto, tanggal, acara, dan konten undangan melalui CMS. Anda dapat memberikan materi melalui WhatsApp.',
  ],
  [
    'Bagaimana cara mengecek pesanan?',
    'Buka Cek Pesanan, lalu masukkan Order ID dan nomor WhatsApp yang digunakan saat memesan.',
  ],
  [
    'Apakah undangan bisa dibuka dari smartphone?',
    'Ya. Undangan dirancang mobile-first dan menyesuaikan layar smartphone, tablet, laptop, serta desktop.',
  ],
]
</script>
<template>
  <main>
    <section class="landing-hero p-container">
      <div class="hero-copy">
        <p class="p-eyebrow"><span></span>RADINA · DIGITAL INVITATION</p>
        <h1>
          Abadikan Momen<br />Bahagia Anda dalam<br /><em>Undangan Digital</em><br />yang Berkesan.
        </h1>
        <p>
          Radina membantu Anda membuat undangan digital untuk pernikahan, khitanan, acara kantor,
          ulang tahun, aqiqah, dan acara lainnya. Mudah diisi dan dibagikan.
        </p>
        <div class="hero-actions">
          <RouterLink to="/templates" class="p-button"
            >Lihat Template<ArrowUpRight :size="17" /></RouterLink
          ><RouterLink to="/templates" class="text-link">Pesan Sekarang →</RouterLink>
        </div>
        <div class="hero-small-note">
          <Heart :size="15" />Designed with love. Shared with everyone.
        </div>
      </div>
      <div class="hero-showcase">
        <span class="showcase-circle"></span>
        <div class="invitation-mockup">
          <img
            v-if="templates[0]"
            :src="templates[0].thumbnail"
            alt="Pratinjau desain undangan romantis"
            fetchpriority="high"
          />
          <div class="mockup-overlay"></div>
          <span class="mockup-top">A CELEBRATION OF LOVE</span>
          <div class="mockup-name">Our<br /><em>forever.</em></div>
          <span class="mockup-bottom"
            >YOU ARE CORDIALLY INVITED<br />TO OUR BEAUTIFUL BEGINNING</span
          >
        </div>
        <span class="showcase-note"
          >a little invitation,<br /><em>a lifetime of memories.</em></span
        >
        <div class="showcase-tag">
          <Leaf :size="18" />
          <div>Thoughtfully crafted<small>ROMANTIC · TIMELESS · YOURS</small></div>
        </div>
      </div>
    </section>
    <section class="p-container event-types-section">
      <div class="p-centered-heading">
        <p class="p-eyebrow">UNTUK SETIAP MOMEN</p>
        <h2>Satu undangan, banyak cerita.</h2>
        <p>Pilih jenis acara; isi, nama, dan preview mengikuti kebutuhan Anda.</p>
      </div>
      <div class="event-types-grid">
        <RouterLink
          v-for="option in eventOptions"
          :key="option.value"
          :to="{
            path: '/templates',
            query: { event_type: option.value },
          }"
          class="surface"
          >{{ option.label }}<ArrowUpRight :size="17"
        /></RouterLink>
      </div>
    </section>

    <section class="p-section p-container radina-gift-intro">
      <p class="p-eyebrow">WEDDING GIFT</p>
      <h2>Tanda kasih,<br /><em>langsung untuk mempelai.</em></h2>
      <p>
        Hadirkan rekening bank, e-wallet, QRIS, dan alamat hadiah dalam satu undangan. Tamu dapat
        menyalin nomor atau mengunduh QR. Transfer dilakukan melalui aplikasi masing-masing; Radina
        tidak menerima atau menyimpan dana hadiah.
      </p>
    </section>
    <div class="benefit-strip">
      <span><Check :size="15" />Mobile-first design</span
      ><span><Check :size="15" />Dibantu admin</span><span><Check :size="15" />Mudah dibagikan</span
      ><span><Check :size="15" />Personal untuk Anda</span>
    </div>
    <section class="p-section p-container">
      <div class="p-section-header">
        <div>
          <p class="p-eyebrow">THE COLLECTION</p>
          <h2>Temukan desain<br />yang terasa <em>seperti Anda.</em></h2>
        </div>
        <RouterLink to="/templates" class="text-link"
          >Jelajahi Template<ArrowUpRight :size="16"
        /></RouterLink>
      </div>
      <div class="featured-collection">
        <div class="collection-story">
          <span class="collection-number">01</span>
          <p class="p-eyebrow">THOUGHTFULLY DESIGNED</p>
          <h3>A little floral,<br />a little magic.</h3>
          <p>
            Ornamen bunga yang lembut, typography elegan, dan setiap detail yang mengalir menjadi
            sebuah cerita.
          </p>
          <span class="collection-signature">Made for your forever.</span>
        </div>
        <TemplateCard v-for="template in templates" :key="template.id" :template="template" />
      </div>
    </section>
    <section class="p-section benefits-section">
      <div class="p-container">
        <div class="p-centered-heading">
          <p class="p-eyebrow">MORE THAN AN INVITATION</p>
          <h2>Detail kecil.<br /><em>Kesan yang tak terlupakan.</em></h2>
        </div>
        <div class="benefits-grid">
          <article v-for="feature in features" :key="feature.title">
            <component :is="feature.icon" :size="27" />
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.text }}</p>
          </article>
        </div>
      </div>
    </section>
    <section id="how-it-works" class="p-section p-container">
      <div class="p-centered-heading">
        <p class="p-eyebrow">YOUR JOURNEY STARTS HERE</p>
        <h2>Empat langkah<br />menuju <em>hari bahagia.</em></h2>
      </div>
      <div class="steps-grid">
        <article
          v-for="(step, i) in [
            ['Pilih desain', 'Temukan template yang paling sesuai dengan cerita Anda.'],
            ['Buat pesanan', 'Isi data dan dapatkan Order ID serta detail pembayaran.'],
            [
              'Konfirmasi & kirim materi',
              'Transfer, lalu kirim bukti dan materi undangan melalui WhatsApp.',
            ],
            ['Siap dibagikan', 'Admin menyiapkan dan mempublish tautan undangan Anda.'],
          ]"
          :key="i"
        >
          <span>0{{ i + 1 }}</span>
          <h3>{{ step[0] }}</h3>
          <p>{{ step[1] }}</p>
        </article>
      </div>
    </section>
    <section class="p-section invitation-features">
      <div class="p-container feature-columns">
        <div>
          <p class="p-eyebrow">ALL THE LITTLE THINGS</p>
          <h2>Satu tautan.<br /><em>Seluruh cerita Anda.</em></h2>
          <p>Semua yang dibutuhkan tamu untuk menjadi bagian dari momen istimewa Anda.</p>
        </div>
        <div class="feature-pills">
          <span
            v-for="feature in [
              { icon: Music, label: 'Musik romantis' },
              { icon: Camera, label: 'Galeri kenangan' },
              { icon: MapPin, label: 'Peta lokasi' },
              { icon: MailCheck, label: 'RSVP & ucapan' },
              { icon: Gift, label: 'Hadiah opsional' },
              { icon: Heart, label: 'Bunga bergerak' },
            ]"
            :key="feature.label"
            ><component :is="feature.icon" :size="18" />{{ feature.label }}</span
          >
        </div>
      </div>
    </section>
    <section class="p-section p-container pricing-section">
      <div>
        <p class="p-eyebrow">BEAUTIFUL, WITHOUT THE COMPLICATION</p>
        <h2>Mulai cerita indah<br /><em>dengan cara sederhana.</em></h2>
        <p>Paket template mencakup fitur undangan dan pengisian konten oleh admin.</p>
      </div>
      <div v-if="templates[0]" class="price-card">
        <p class="p-eyebrow">{{ templates[0].name }}</p>
        <strong>{{ formatMoney(templates[0].price) }}</strong>
        <p>Satu undangan, personal untuk Anda.</p>
        <ul>
          <li v-for="item in templates[0].features.slice(0, 5)" :key="item">
            <Check :size="15" />{{ item }}
          </li>
        </ul>
        <RouterLink :to="`/order/${templates[0].slug}`" class="p-button"
          >Pesan Sekarang<ArrowUpRight :size="17"
        /></RouterLink>
      </div>
    </section>
    <section class="p-section p-container bouquet-teaser">
      <img
        src="/images/bouquets/buket-05.jpg"
        alt="Buket bunga custom dengan boneka wisuda"
        width="960"
        height="1280"
        loading="lazy"
      />
      <div>
        <p class="p-eyebrow">SEBUAH HADIAH, SEBUAH CERITA</p>
        <h2>Buket untuk<br /><em>momen istimewa.</em></h2>
        <p>
          Bukan hanya undangan. Lengkapi wisuda, ulang tahun, dan hari bahagia dengan buket custom
          sesuai keinginan Anda. Harga mulai <strong>Rp100.000</strong>.
        </p>
        <RouterLink to="/buket" class="p-button"
          >Lihat Koleksi Buket<ArrowUpRight :size="17"
        /></RouterLink>
      </div>
    </section>
    <section class="p-section p-container faq-section">
      <div>
        <p class="p-eyebrow">A FEW THINGS YOU MIGHT WONDER</p>
        <h2>Pertanyaan <em>Anda.</em><br />Jawaban kami.</h2>
      </div>
      <div>
        <details v-for="faq in faqs" :key="faq[0]">
          <summary>{{ faq[0] }}</summary>
          <p>{{ faq[1] }}</p>
        </details>
      </div>
    </section>
    <section class="landing-cta">
      <Heart :size="26" />
      <p class="p-eyebrow">LET'S MAKE IT BEAUTIFUL</p>
      <h2>Cerita cinta Anda.<br /><em>Undangan yang tak terlupakan.</em></h2>
      <RouterLink to="/templates" class="p-button light"
        >Mulai Cerita Anda<ArrowUpRight :size="17"
      /></RouterLink>
    </section>
  </main>
</template>
<style scoped>
.bouquet-teaser {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 60px;
  align-items: center;
}
.bouquet-teaser img {
  width: 100%;
  height: auto;
  max-height: 460px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 100px 100px 8px 8px;
}
.bouquet-teaser > div > p:not(.p-eyebrow) {
  max-width: 440px;
  color: #7c896b;
  font-size: 13px;
  line-height: 1.9;
  margin: 24px 0;
}
.bouquet-teaser strong {
  color: #7b4337;
  font-weight: 500;
}
@media (max-width: 700px) {
  .bouquet-teaser {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>

<style>
.event-types-section {
  padding-block: 60px;
}
.event-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 16px;
}
.event-types-grid a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 22px;
  text-decoration: none;
  color: inherit;
}
</style>
