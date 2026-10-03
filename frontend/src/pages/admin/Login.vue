<script setup>
import RadinaLogo from "../../components/RadinaLogo.vue";
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
    Heart,
    ArrowRight,
    LockKeyhole,
    Eye,
    EyeOff,
    RefreshCw,
} from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { usePlatformStore } from "../../stores/platform";
const platform = usePlatformStore();
platform.load();
import { api, errorMessage } from "../../services/api";
import FormField from "../../components/FormField.vue";
const auth = useAuthStore(),
    route = useRoute(),
    router = useRouter(),
    form = reactive({ email: "", password: "", captcha: "" }),
    showPassword = ref(false),
    captchaQuestion = ref(""),
    captchaLoading = ref(false),
    captchaError = ref(""),
    pending = ref(false),
    error = ref("");
async function loadCaptcha() {
    captchaLoading.value = true;
    captchaError.value = "";
    captchaQuestion.value = "";
    form.captcha = "";
    try {
        captchaQuestion.value = (
            await api.get("/admin/captcha")
        ).data.data.question;
    } catch (e) {
        captchaError.value = errorMessage(e);
    } finally {
        captchaLoading.value = false;
    }
}
onMounted(loadCaptcha);
async function login() {
    if (pending.value || captchaLoading.value || !captchaQuestion.value) return;
    pending.value = true;
    error.value = "";
    try {
        await auth.login(form);
        const redirect =
            typeof route.query.redirect === "string" &&
            route.query.redirect.startsWith("/admin")
                ? route.query.redirect
                : "/admin";
        router.push(redirect);
    } catch (e) {
        error.value = errorMessage(e);
        await loadCaptcha();
    } finally {
        pending.value = false;
    }
}
</script>
<template>
    <main class="platform login-page">
        <div class="login-story">
            <Heart :size="30" />
            <p class="p-eyebrow">
                {{ platform.settings.company_name || "Wedding" }} STUDIO
            </p>
            <h1>
                Behind every<br />beautiful invitation,<br /><em
                    >there's a little care.</em
                >
            </h1>
            <p>Your workspace for once-in-a-lifetime stories.</p>
        </div>
        <div class="login-panel">
            <RouterLink to="/" class="brand"><RadinaLogo /></RouterLink>
            <p class="p-eyebrow">WELCOME BACK</p>
            <h2>Ruang untuk<br />cerita yang indah.</h2>
            <p>Masuk untuk mengelola pesanan dan undangan.</p>
            <form @submit.prevent="login">
                <FormField
                    v-model="form.email"
                    label="Email admin"
                    type="email"
                    required
                />
                <div class="field">
                    <label for="admin-password"
                        >Kata sandi <span>*</span></label
                    >
                    <div class="password-control">
                        <input
                            id="admin-password"
                            v-model="form.password"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            class="password-toggle"
                            :aria-label="
                                showPassword
                                    ? 'Sembunyikan password'
                                    : 'Tampilkan password'
                            "
                            :aria-pressed="showPassword"
                            aria-controls="admin-password"
                            @click="showPassword = !showPassword"
                        >
                            <EyeOff v-if="showPassword" :size="19" />
                            <Eye v-else :size="19" />
                        </button>
                    </div>
                </div>
                <div class="field">
                    <label for="admin-captcha"
                        >Jawaban CAPTCHA <span>*</span></label
                    >
                    <div class="captcha-challenge">
                        <span data-testid="captcha-question" aria-live="polite">
                            {{
                                captchaLoading
                                    ? "Memuat soal…"
                                    : captchaQuestion
                                      ? `${captchaQuestion} = ?`
                                      : "Soal belum tersedia"
                            }}
                        </span>
                        <button
                            type="button"
                            class="captcha-refresh"
                            :disabled="captchaLoading || pending"
                            aria-label="Ganti soal CAPTCHA"
                            @click="loadCaptcha"
                        >
                            <RefreshCw :size="16" />Ganti soal
                        </button>
                    </div>
                    <input
                        id="admin-captcha"
                        v-model="form.captcha"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]{1,2}"
                        maxlength="2"
                        autocomplete="off"
                        placeholder="Hasil penjumlahan"
                        aria-describedby="captcha-help"
                        :disabled="captchaLoading || !captchaQuestion"
                        required
                    />
                    <small id="captcha-help"
                        >Jumlahkan kedua angka di atas. Soal berlaku selama 5
                        menit.</small
                    >
                </div>
                <p v-if="captchaError" class="alert error" role="alert">
                    {{ captchaError }}
                </p>
                <p v-if="error" class="alert error" role="alert">{{ error }}</p>
                <button
                    class="p-button full-width"
                    :disabled="pending || captchaLoading || !captchaQuestion"
                >
                    {{ pending ? "Masuk…" : "Masuk ke Workspace"
                    }}<ArrowRight :size="17" />
                </button>
            </form>
            <small><LockKeyhole :size="13" />Akses khusus administrator.</small>
        </div>
    </main>
</template>
<style scoped>
.password-control {
    position: relative;
}
.password-control input {
    padding-right: 52px;
}
.password-toggle {
    position: absolute;
    inset: 0 0 0 auto;
    display: grid;
    place-items: center;
    width: 46px;
    border: 0;
    background: transparent;
    color: #53664a;
    cursor: pointer;
}
.captcha-challenge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid #d9dfce;
    border-radius: 4px;
    background: #f3f1de;
}
.captcha-challenge > span {
    font-weight: 600;
    font-size: 15px;
}
.captcha-refresh {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: #4b5e42;
    cursor: pointer;
    font-size: 12px;
}
.password-toggle:focus-visible,
.captcha-refresh:focus-visible {
    outline: 2px solid #53664a;
    outline-offset: 2px;
}
</style>
