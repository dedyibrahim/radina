<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, ArrowLeft, LockKeyhole, Check } from 'lucide-vue-next'
import { api, errorMessage, formatMoney } from '../../services/api'
import FormField from '../../components/FormField.vue'
import PageState from '../../components/PageState.vue'
import { eventOptions, eventProfile } from '../../services/invitationEvents'
const route = useRoute(),
  router = useRouter(),
  template = ref(null),
  loading = ref(true),
  pending = ref(false),
  error = ref(''),
  review = ref(false),
  slugTouched = ref(false)
const location = window.location
const form = reactive({
  event_type: eventOptions.some((option) => option.value === route.query.event_type)
    ? route.query.event_type
    : 'wedding',
  event_title: '',
  host_name: '',
  honoree_name: '',
  customer_name: '',
  whatsapp: '',
  email: '',
  bride_name: '',
  groom_name: '',
  slug: '',
})
const isWedding = computed(() => form.event_type === 'wedding')
const profile = computed(() => eventProfile(form.event_type))
watch(
  () => [form.bride_name, form.groom_name, form.event_title, form.event_type],
  () => {
    if (!slugTouched.value)
      form.slug = (
        isWedding.value
          ? `${form.bride_name.split(' ')[0]}-${form.groom_name.split(' ')[0]}`
          : form.event_title
      )
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
  },
)
async function load() {
  try {
    template.value = (await api.get(`/templates/${route.params.template}`)).data.data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
function next() {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug) ||
    form.slug.length < 3 ||
    form.slug.length > 80
  ) {
    error.value = 'Slug harus 3–80 karakter, huruf kecil, angka, dan dash.'
    return
  }
  error.value = ''
  review.value = true
}
async function submit() {
  pending.value = true
  error.value = ''
  try {
    const order = (
      await api.post('/orders', {
        ...form,
        template_id: template.value.id,
      })
    ).data.data
    sessionStorage.setItem(`order:${order.order_number}`, order.whatsapp)
    router.push(`/order/success/${order.order_number}`)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <main class="p-container order-page">
    <p class="p-eyebrow">A BEAUTIFUL BEGINNING</p>
    <h1>{{ review ? 'Satu langkah lagi.' : 'Mari mulai cerita Anda.' }}</h1>
    <p class="page-intro">
      {{
        review
          ? 'Periksa detail pesanan sebelum melanjutkan pembayaran.'
          : 'Isi detail singkat berikut. Kami akan membantu sisanya.'
      }}
    </p>
    <PageState v-if="loading" loading />
    <div v-else-if="template" class="order-grid">
      <form class="surface order-form" @submit.prevent="review ? submit() : next()">
        <template v-if="!review"
          ><div class="form-step">
            <span>01</span>
            <h2>Detail pemesan</h2>
          </div>
          <FormField v-model="form.customer_name" label="Nama Pemesan" required /><FormField
            v-model="form.whatsapp"
            label="Nomor WhatsApp"
            type="tel"
            placeholder="08… atau 628…"
            required
          /><FormField v-model="form.email" label="Email (opsional)" type="email" />
          <div class="form-step">
            <span>02</span>
            <h2>Detail undangan</h2>
          </div>
          <label class="form-field"
            >Jenis acara<select v-model="form.event_type" aria-label="Jenis acara">
              <option v-for="option in eventOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select></label
          >
          <template v-if="!isWedding"
            ><FormField v-model="form.event_title" label="Judul acara" required /><FormField
              v-model="form.host_name"
              :label="profile.host_label"
              required /><FormField
              v-if="profile.honoree"
              v-model="form.honoree_name"
              :label="profile.honoree_label"
              required
          /></template>
          <template v-if="isWedding"
            ><FormField
              v-model="form.bride_name"
              label="Nama Pengantin Wanita"
              required /><FormField
              v-model="form.groom_name"
              label="Nama Pengantin Pria"
              required /></template
          ><FormField
            v-model="form.slug"
            label="Slug Undangan"
            required
            placeholder="alya-rizky"
            @update:model-value="slugTouched = true"
          />
          <div class="slug-preview">
            {{ location?.origin || '' }}/w/<strong>{{ form.slug || 'cerita-anda' }}</strong>
          </div></template
        ><template v-else
          ><div class="form-step">
            <Check :size="24" />
            <h2>Ringkasan pesanan</h2>
          </div>
          <dl class="summary-list">
            <div>
              <dt>Pemesan</dt>
              <dd>{{ form.customer_name }}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{{ form.whatsapp }}</dd>
            </div>
            <div>
              <dt>{{ profile.label }}</dt>
              <dd>
                {{ isWedding ? `${form.bride_name} & ${form.groom_name}` : form.event_title }}
              </dd>
            </div>
            <div>
              <dt>Template</dt>
              <dd>{{ template.name }}</dd>
            </div>
            <div>
              <dt>URL Undangan</dt>
              <dd>/w/{{ form.slug }}</dd>
            </div>
            <div class="summary-total">
              <dt>Total</dt>
              <dd>{{ formatMoney(template.price) }}</dd>
            </div>
          </dl>
          <button type="button" class="text-link" @click="review = false">
            <ArrowLeft :size="16" />Edit data
          </button></template
        >
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <button class="p-button full-width" :disabled="pending">
          {{ pending ? 'Membuat Pesanan…' : review ? 'Buat Pesanan' : 'Lanjutkan'
          }}<ArrowRight :size="17" />
        </button>
        <p class="privacy-note">
          <LockKeyhole :size="13" />Pembayaran transfer manual. Belum ada pembayaran pada langkah
          ini.
        </p>
      </form>
      <aside class="order-template-card">
        <img :src="template.thumbnail" :alt="template.name" />
        <p class="p-eyebrow">YOUR CHOSEN DESIGN</p>
        <h2>{{ template.name }}</h2>
        <p>{{ template.category?.name }} · Personal untuk Anda</p>
        <strong>{{ formatMoney(template.price) }}</strong>
        <ul>
          <li v-for="feature in template.features.slice(0, 4)" :key="feature">
            <Check :size="14" />{{ feature }}
          </li>
        </ul>
      </aside>
    </div>
    <PageState v-else :error="error" @retry="load" />
  </main>
</template>
