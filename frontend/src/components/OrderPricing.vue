<script setup>
import { formatMoney } from '../services/api'
defineProps({ order: Object })
</script>
<template>
  <section
    v-if="
      order.pricing?.package ||
      order.pricing?.addons?.length ||
      order.invitation_expires_at
    "
    class="order-pricing"
  >
    <h3>Rincian layanan</h3>
    <dl v-if="order.pricing" class="summary-list">
      <div v-for="(item, index) in order.pricing.items" :key="index">
        <dt>{{ item.description }}</dt>
        <dd>{{ formatMoney(item.amount) }}</dd>
      </div>
    </dl>
    <p v-if="order.pricing?.package">
      {{ order.pricing.package.name }} ·
      {{
        order.pricing.package.duration_days
          ? `${order.pricing.package.duration_days} hari sejak pertama dipublish`
          : 'Tanpa batas masa aktif'
      }}
    </p>
    <p v-if="order.invitation_expires_at">
      Aktif sampai
      {{ new Date(order.invitation_expires_at).toLocaleString('id-ID') }}.
    </p>
  </section>
</template>
<style scoped>
.order-pricing {
  margin: 20px 0;
  border: 1px solid #dce5d6;
  background: #f8faf4;
  border-radius: 12px;
  padding: 22px;
}
.order-pricing p {
  font-size: 13px;
  margin-top: 12px;
}
.order-pricing h3 {
  font-size: 21px;
}
</style>
