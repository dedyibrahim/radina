<script setup>
import ReminderList from '../../components/ReminderList.vue'
</script>
<template>
  <div>
    <div class="admin-title">
      <div>
        <p class="p-eyebrow">KEEP THINGS MOVING</p>
        <h1>Pengingat Pesanan</h1>
        <p>
          Pengingat diperbarui otomatis dan tampil di dashboard serta portal
          pelanggan.
        </p>
      </div>
    </div>
    <section class="surface reminder-page"><ReminderList admin /></section>
  </div>
</template>
<style scoped>
.reminder-page {
  padding: 28px;
}
</style>
