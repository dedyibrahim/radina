<script setup>
import { computed } from 'vue'
import { Copy } from 'lucide-vue-next'
import { usePlatformStore } from '../stores/platform'
import { useUiStore } from '../stores/ui'
const platform = usePlatformStore(), ui = useUiStore()
const accounts = computed(() => [
  { name: platform.settings.bank_name, number: platform.settings.bank_account, holder: platform.settings.bank_account_name },
  { name: platform.settings.secondary_bank_name, number: platform.settings.secondary_bank_account, holder: platform.settings.secondary_bank_account_name },
].filter(account => account.name && account.number && account.holder))
async function copy(account) {
  try {
    await navigator.clipboard.writeText(account.number)
    ui.toast(`Nomor rekening ${account.name} berhasil disalin.`)
  } catch {
    ui.toast('Salin nomor rekening secara manual.')
  }
}
</script>
<template>
  <div v-if="accounts.length" class="payment-accounts">
    <p class="p-eyebrow">PILIH REKENING PEMBAYARAN</p>
    <div class="payment-account-grid">
      <div v-for="account in accounts" :key="`${account.name}-${account.number}`" class="payment-bank">
        <h3>{{ account.name }}</h3>
        <strong>{{ account.number }}</strong>
        <p>a/n {{ account.holder }}</p>
        <button type="button" class="text-link" :aria-label="`Salin nomor rekening ${account.name}`" @click="copy(account)"><Copy :size="15" />Salin Nomor Rekening</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.payment-accounts > .p-eyebrow { margin-bottom: 14px; }
.payment-account-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.payment-bank { min-width: 0; text-align: left; }
.payment-bank > strong { font-size: 24px; letter-spacing: 1px; }
.payment-bank > p { margin-top: 9px; }
@media (max-width: 700px) { .payment-account-grid { grid-template-columns: 1fr; } }
@media (max-width: 400px) { .payment-bank > strong { font-size: 20px; letter-spacing: .3px; } }
</style>
