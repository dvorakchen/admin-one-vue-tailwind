<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'td'
  },
  checked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['checked'])

function handleChange(ev: Event) {
  const ele = ev.target! as HTMLInputElement
  emit('checked', ele.checked)
}
</script>

<template>
  <component :is="type" class="lg:w-1">
    <label class="checkbox">
      <input :checked="checked" type="checkbox" @change="handleChange" />
      <span class="check" />
    </label>
  </component>
</template>
