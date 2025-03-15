<script setup lang="ts">
import Icon from "@/components/Icon.vue";

defineProps<{
  icon: string;
  label: string;
  to: string;
}>();
</script>

<template>
  <RouterLink
    class="flex gap-4 transition-[padding]"
    active-class="pl-8 text-base-100"
    :to="to"
  >
    <Icon :d="icon" />
    {{ label }}
  </RouterLink>
</template>
