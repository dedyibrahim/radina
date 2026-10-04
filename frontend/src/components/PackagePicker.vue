<script setup>
import { computed } from 'vue'
import { formatMoney } from '../services/api'
const props = defineProps({
  offers: Object,
  packageId: [String, Number],
  addonIds: Array,
  basePrice: [String, Number],
})
const emit = defineEmits(['update:packageId', 'update:addonIds'])
const selected = computed(() =>
  props.offers.packages.find((p) => Number(p.id) === Number(props.packageId)),
)
function toggle(id, checked) {
  emit(
    'update:addonIds',
    checked
      ? [...props.addonIds, Number(id)]
      : props.addonIds.filter((value) => Number(value) !== Number(id)),
  )
}
</script>
<template>
  <fieldset
    v-if="offers.packages.length || offers.addons.length"
    class="package-picker"
  >
    <legend>Paket dan tambahan</legend>
    <label v-if="offers.packages.length" class="form-field"
      >Pilih paket<select
        :value="packageId || ''"
        aria-label="Pilih paket"
        @change="
          emit(
            'update:packageId',
            $event.target.value ? Number($event.target.value) : null,
          )
        "
      >
        <option value="">Harga template — {{ formatMoney(basePrice) }}</option>
        <option v-for="p in offers.packages" :key="p.id" :value="p.id">
          {{ p.name }} — {{ p.pricing_mode === 'TEMPLATE_PLUS' ? '+' : ''
          }}{{ formatMoney(p.price)
          }}{{ p.pricing_mode === 'FIXED' ? ' (termasuk template)' : '' }}
        </option>
      </select></label
    >
    <div v-if="selected" class="alert">
      <strong>{{ selected.name }}</strong>
      <p>{{ selected.description }}</p>
      <p>
        {{
          selected.duration_days
            ? `Masa aktif ${selected.duration_days} hari sejak publish`
            : 'Tanpa batas masa aktif'
        }}
      </p>
      <ul>
        <li v-for="feature in selected.features || []" :key="feature">
          {{ feature }}
        </li>
      </ul>
    </div>
    <label v-for="addon in offers.addons" :key="addon.id" class="addon-choice"
      ><input
        type="checkbox"
        :checked="addonIds.some((id) => Number(id) === Number(addon.id))"
        @change="toggle(addon.id, $event.target.checked)"
      /><span
        >{{ addon.name }}<small>{{ addon.description }}</small></span
      ><strong>+{{ formatMoney(addon.price) }}</strong></label
    >
  </fieldset>
</template>
<style scoped>
.package-picker {
  border: 1px solid #dce5d6;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
}
.package-picker legend {
  font-weight: 600;
  padding: 0 8px;
}
.addon-choice {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0;
}
.addon-choice span {
  flex: 1;
}
.addon-choice small {
  display: block;
  font-size: 12px;
  color: #708176;
}
.addon-choice input {
  width: 18px;
  height: 18px;
}
</style>
