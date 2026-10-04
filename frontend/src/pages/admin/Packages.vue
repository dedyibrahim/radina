<script setup>
import { ref, onMounted } from 'vue'
import { api, errorMessage, formatMoney } from '../../services/api'
import FormField from '../../components/FormField.vue'
import PageState from '../../components/PageState.vue'
import BaseModal from '../../components/BaseModal.vue'
const offers = ref(null),
  error = ref(''),
  busy = ref(false),
  form = ref(null),
  type = ref('packages'),
  saved = ref('')
async function load() {
  try {
    offers.value = (await api.get('/admin/packages')).data.data
  } catch (e) {
    error.value = errorMessage(e)
  }
}
onMounted(load)
function edit(item, kind) {
  type.value = kind
  form.value = JSON.parse(
    JSON.stringify(
      item ||
        (kind === 'packages'
          ? {
              name: '',
              slug: '',
              description: '',
              pricing_mode: 'TEMPLATE_PLUS',
              price: null,
              duration_days: null,
              features: [],
              is_active: false,
              sort_order: 0,
            }
          : {
              name: '',
              description: '',
              price: 0,
              is_active: false,
            }),
    ),
  )
  form.value.featureText = (form.value.features || []).join('\n')
  error.value = ''
  saved.value = ''
}
async function save() {
  busy.value = true
  error.value = ''
  try {
    const data = { ...form.value }
    if (type.value === 'packages') {
      data.features = data.featureText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      data.price =
        data.price === '' || data.price === null ? null : Number(data.price)
      data.duration_days =
        data.duration_days === '' || data.duration_days === null
          ? null
          : Number(data.duration_days)
    }
    delete data.featureText
    const path = `/admin/${type.value}${data.id ? `/${data.id}` : ''}`
    await api[data.id ? 'put' : 'post'](path, data)
    form.value = null
    await load()
    saved.value =
      'Harga disimpan. Pesanan yang sudah dibuat tetap memakai rincian harga sebelumnya.'
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div>
    <div class="admin-title">
      <div>
        <p class="p-eyebrow">PRICING</p>
        <h1>Paket & Tambahan</h1>
        <p>
          Harga template tetap berlaku bagi pelanggan yang tidak memilih paket.
        </p>
      </div>
      <button class="p-button" @click="edit(null, 'packages')">
        Tambah paket
      </button>
    </div>
    <p v-if="saved" class="alert">{{ saved }}</p>
    <PageState
      v-if="!offers"
      :loading="!error"
      :error="error"
      @retry="load"
    /><template v-else
      ><div class="package-grid">
        <article v-for="p in offers.packages" :key="p.id" class="surface">
          <p class="p-eyebrow">
            {{ p.is_active ? 'AKTIF' : 'BELUM DIAKTIFKAN' }}
          </p>
          <h2>{{ p.name }}</h2>
          <strong class="package-price">{{
            p.price === null ? 'Harga belum diisi' : formatMoney(p.price)
          }}</strong>
          <p>
            {{
              p.pricing_mode === 'FIXED'
                ? 'Harga termasuk template'
                : 'Tambahan atas harga template'
            }}
          </p>
          <p>
            {{
              p.duration_days
                ? `${p.duration_days} hari sejak publish`
                : 'Tanpa batas masa aktif'
            }}
          </p>
          <p>{{ p.description }}</p>
          <ul>
            <li v-for="feature in p.features || []" :key="feature">
              {{ feature }}
            </li>
          </ul>
          <button class="p-button secondary" @click="edit(p, 'packages')">
            Atur {{ p.name }}
          </button>
        </article>
      </div>
      <section class="surface addons">
        <div class="panel-title">
          <h2>Tambahan opsional</h2>
          <button class="p-button secondary" @click="edit(null, 'addons')">
            Tambah layanan
          </button>
        </div>
        <p v-if="!offers.addons.length">
          Belum ada layanan tambahan. Harga dan ketersediaan dapat Anda atur
          sendiri.
        </p>
        <div v-for="addon in offers.addons" :key="addon.id" class="addon-row">
          <div>
            <strong>{{ addon.name }}</strong>
            <p>
              {{ formatMoney(addon.price) }} ·
              {{ addon.is_active ? 'Aktif' : 'Nonaktif' }}
            </p>
          </div>
          <button class="p-button secondary" @click="edit(addon, 'addons')">
            Edit
          </button>
        </div>
      </section></template
    >
    <BaseModal
      :open="!!form"
      :title="type === 'packages' ? 'Atur paket' : 'Atur tambahan'"
      @close="!busy && (form = null)"
      ><form v-if="form" @submit.prevent="save">
        <FormField v-model="form.name" label="Nama" required /><template
          v-if="type === 'packages'"
          ><FormField
            v-model="form.slug"
            label="Kode paket (huruf kecil dan tanda hubung)"
            required
          /><label class="form-field"
            >Perhitungan harga<select v-model="form.pricing_mode">
              <option value="TEMPLATE_PLUS">
                Tambahan atas harga template
              </option>
              <option value="FIXED">Harga paket termasuk template</option>
            </select></label
          ></template
        >
        <div class="field">
          <label for="package-price"
            >Harga (Rp)
            <span v-if="type === 'addons' || form.is_active">*</span></label
          >
          <input
            id="package-price"
            v-model.number="form.price"
            type="number"
            min="0"
            :max="type === 'addons' ? 10000000 : 100000000"
            step="1"
            :required="type === 'addons' || form.is_active"
          />
        </div>
        <FormField
          v-model="form.description"
          label="Deskripsi"
          type="textarea"
        /><template v-if="type === 'packages'"
          ><div class="field">
            <label for="package-duration"
              >Masa aktif (hari sejak publish; kosong = tanpa batas)</label
            >
            <input
              id="package-duration"
              v-model.number="form.duration_days"
              type="number"
              min="1"
              max="3650"
              step="1"
            />
          </div>
          <FormField
            v-model="form.featureText"
            label="Fitur paket (satu per baris)"
            type="textarea" /></template
        ><label class="toggle-field"
          ><input v-model="form.is_active" type="checkbox" />Tampilkan untuk
          pemesanan</label
        >
        <p v-if="error" class="alert error" role="alert">{{ error }}</p>
        <button class="p-button full-width" :disabled="busy">
          {{ busy ? 'Menyimpan…' : 'Simpan' }}
        </button>
      </form></BaseModal
    >
  </div>
</template>
<style scoped>
.package-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.package-grid article,
.addons {
  padding: 24px;
}
.package-price {
  display: block;
  font-size: 24px;
  margin: 20px 0;
}
.package-grid ul {
  padding-left: 18px;
  margin: 18px 0;
}
.addons {
  margin-top: 24px;
}
.addon-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #e1e7db;
}
@media (max-width: 900px) {
  .package-grid {
    grid-template-columns: 1fr;
  }
}
</style>
