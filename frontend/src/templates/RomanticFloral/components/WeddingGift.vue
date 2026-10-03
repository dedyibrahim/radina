<script setup>
import { useGift } from '../../../composables/useGift'
import { Copy, Gift, Download, MapPin } from 'lucide-vue-next'
import FlowerMotion from './FlowerMotion.vue'
import SectionHeading from './SectionHeading.vue'
import BaseModal from '../../../components/BaseModal.vue'
const emit = defineEmits(['toast'])
const { wedding, active, address, downloading, tabs, methods, copy, download } = useGift(
  (message) => emit('toast', message),
)
</script>
<template>
  <section id="gift" class="section gift-section">
    <FlowerMotion /><SectionHeading
      :eyebrow="wedding.isWedding ? 'WEDDING GIFT' : 'TANDA KASIH'"
      title="Tanda Kasih"
      subtitle="Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan tanda kasih, Anda dapat memberikan hadiah melalui pilihan berikut."
    />
    <p v-if="wedding.isDemo" class="sample-note">Data hadiah demo — bukan untuk transaksi.</p>
    <div class="radina-gift-tabs" role="tablist" aria-label="Metode hadiah">
      <button
        v-for="type in tabs"
        :key="type.key"
        role="tab"
        :aria-selected="active === type.key"
        :class="{ active: active === type.key }"
        @click="active = type.key"
      >
        {{ type.label }}
      </button>
    </div>
    <div class="bank-list" role="tabpanel">
      <article v-for="gift in methods" :key="gift.id" class="bank-card">
        <div class="bank-header">
          <span>{{ gift.provider || gift.recipient_name }}</span
          ><img
            v-if="gift.logo"
            :src="gift.logo"
            alt="Logo provider"
            class="gift-provider-logo"
            loading="lazy"
          />
        </div>
        <template v-if="['BANK', 'EWALLET'].includes(gift.type)"
          ><p class="bank-number">{{ gift.account_number }}</p>
          <p class="bank-owner">{{ gift.account_name }}</p>
          <button class="copy-button" @click="copy(gift.account_number, gift.type)">
            <Copy :size="15" />{{ gift.type === 'BANK' ? 'Salin Rekening' : 'Salin Nomor' }}
          </button></template
        ><template v-else-if="gift.type === 'QRIS'"
          ><img
            :src="gift.qr_image"
            :alt="`QRIS ${gift.account_name}`"
            class="gift-qr"
            loading="lazy"
          />
          <p class="bank-owner">{{ gift.account_name }}</p>
          <button class="copy-button" :disabled="downloading" @click="download(gift)">
            <Download :size="15" />Download QR
          </button></template
        ><button v-else class="button button-outline" @click="address = gift">
          <Gift :size="16" />Kirim Hadiah
        </button>
        <p v-if="gift.description && gift.type !== 'PHYSICAL'" class="gift-description">
          {{ gift.description }}
        </p>
      </article>
    </div>
    <p class="sample-note">
      Transfer dilakukan melalui aplikasi bank/e-wallet Anda langsung ke
      {{ wedding.isWedding ? 'mempelai' : 'penerima hadiah' }}.
    </p>
    <BaseModal :open="Boolean(address)" title="Alamat pengiriman hadiah" @close="address = null"
      ><div v-if="address" class="address-modal">
        <MapPin :size="28" />
        <p class="eyebrow">KIRIM HADIAH</p>
        <h2>{{ address.recipient_name }}</h2>
        <p style="white-space: pre-line">{{ address.address }}</p>
        <p>{{ address.phone }}</p>
        <p>{{ address.description }}</p>
        <button class="button" @click="copy(address.address, 'PHYSICAL')">
          <Copy :size="15" />Salin Alamat
        </button>
      </div></BaseModal
    >
  </section>
</template>
