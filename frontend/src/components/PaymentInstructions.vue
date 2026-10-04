<script setup>
import RadinaLogo from './RadinaLogo.vue'
import { computed } from 'vue'
import { MessageCircle, ArrowUpRight, CheckCircle2 } from 'lucide-vue-next'
import { api, formatMoney, errorMessage } from '../services/api'
import { usePlatformStore } from '../stores/platform'
import { useUiStore } from '../stores/ui'
import StatusBadge from './StatusBadge.vue'
import OrderPricing from './OrderPricing.vue'
import OrderDocuments from './OrderDocuments.vue'
import PaymentBankAccounts from './PaymentBankAccounts.vue'
const props = defineProps({ order: Object })
const platform = usePlatformStore(),
  ui = useUiStore()
const waiting = computed(() =>
  ['WAITING_PAYMENT', 'PAYMENT_REVIEW'].includes(props.order.status),
)
const whatsapp = computed(() => {
  const text = `Halo Admin Radina,\n\nSaya ingin melakukan konfirmasi pembayaran pesanan Undangan Digital Radina.\n\nOrder ID:\n${props.order.order_number}\n\nNama:\n${props.order.customer_name}\n\nTemplate:\n${props.order.template.name}\n\nNama Pengantin:\n${props.order.bride_name} & ${props.order.groom_name}\n\nTotal:\n${formatMoney(props.order.total)}\n\nMohon dibantu pengecekan pembayaran saya.\nTerima kasih.`
  return platform.settings.whatsapp_number
    ? `https://wa.me/${platform.settings.whatsapp_number}?text=${encodeURIComponent(text)}`
    : ''
})
async function review() {
  try {
    await api.post('/orders/payment-review', {
      order_number: props.order.order_number,
      whatsapp: props.order.whatsapp,
    })
  } catch (e) {
    ui.toast(errorMessage(e))
  }
}
</script>
<template>
  <RadinaLogo />
  <div class="payment-instructions surface">
    <div class="payment-status">
      <CheckCircle2 :size="26" /><StatusBadge :status="order.status" />
    </div>
    <p class="p-eyebrow">YOUR ORDER</p>
    <h2>{{ order.order_number }}</h2>
    <dl class="summary-list">
      <div>
        <dt>Template</dt>
        <dd>{{ order.template.name }}</dd>
      </div>
      <div>
        <dt>
          {{
            order.event_type && order.event_type !== 'wedding'
              ? 'Acara'
              : 'Pengantin'
          }}
        </dt>
        <dd>
          {{
            order.event_type && order.event_type !== 'wedding'
              ? order.event_title
              : `${order.bride_name} & ${order.groom_name}`
          }}
        </dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{{ formatMoney(order.total) }}</dd>
      </div>
    </dl>
    <OrderPricing :order="order" />
    <OrderDocuments :order="order" />
    <template v-if="waiting"
      ><PaymentBankAccounts />
      <p v-if="platform.settings.payment_notice" class="alert">
        {{ platform.settings.payment_notice }}
      </p>
      <p>
        Kirim bukti transfer melalui WhatsApp. Status pembayaran akan berubah
        setelah diperiksa admin.
      </p>
      <a
        v-if="whatsapp"
        :href="whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        class="p-button full-width"
        @click="review"
        ><MessageCircle :size="18" />Konfirmasi Pembayaran via WhatsApp</a
      ></template
    ><template v-else
      ><p v-if="order.status === 'PUBLISHED'">
        Undangan Anda sudah aktif dan siap dibagikan.
      </p>
      <p v-else-if="order.status === 'CANCELLED'">
        Pesanan ini dibatalkan. Hubungi admin jika Anda membutuhkan bantuan.
      </p>
      <p v-else>
        Pembayaran sudah dikonfirmasi. Tim kami sedang menyiapkan hari bahagia
        Anda.
      </p>
      <RouterLink
        v-if="order.status === 'PUBLISHED'"
        :to="`/w/${order.slug}`"
        class="p-button"
        >Lihat Undangan<ArrowUpRight :size="16" /></RouterLink></template
    ><RouterLink to="/check-order" class="text-link payment-check"
      >Cek status pesanan →</RouterLink
    >
  </div>
</template>
