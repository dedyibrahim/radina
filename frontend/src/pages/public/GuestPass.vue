<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api, errorMessage } from '../../services/api'
import GuestQr from '../../components/GuestQr.vue'
import PageState from '../../components/PageState.vue'
import RadinaLogo from '../../components/RadinaLogo.vue'
const route = useRoute(),
  pass = ref(null),
  error = ref('')
onMounted(async () => {
  try {
    pass.value = (
      await api.get(`/guest-passes/${route.params.token}`)
    ).data.data
  } catch (e) {
    error.value = errorMessage(e)
  }
})
</script>
<template>
  <main class="platform guest-pass">
    <section class="surface">
      <RadinaLogo /><PageState
        v-if="!pass"
        :loading="!error"
        :error="error"
      /><template v-else
        ><p class="p-eyebrow">KARTU TAMU</p>
        <h1>{{ pass.name }}</h1>
        <h2>{{ pass.title }}</h2>
        <p>
          {{
            pass.date
              ? new Date(`${pass.date}T12:00:00`).toLocaleDateString('id-ID', {
                  dateStyle: 'long',
                })
              : ''
          }}
        </p>
        <GuestQr :url="pass.pass_url" :name="pass.name" /><a
          :href="pass.invitation_url"
          class="p-button"
          >Lihat Undangan</a
        ></template
      >
    </section>
  </main>
</template>
<style scoped>
.guest-pass {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f6ef;
  padding: 24px;
}
.guest-pass section {
  padding: 32px;
  width: 100%;
  max-width: 560px;
  text-align: center;
}
.guest-pass h1 {
  font-size: 36px;
  margin: 20px 0;
}
.guest-pass h2 {
  font-size: 24px;
}
</style>
