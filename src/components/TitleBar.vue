<script setup lang="ts">
import Icon from "./Icon.vue";

defineProps<{
  icon: string;
  title: string;
}>();
</script>

<template>
  <div class="flex gap-4 items-center mt-4 mb-8">
    <span>
      <Icon :d="icon" :width="30" :height="30" />
    </span>
    <h1 class="text-2xl font-bold">{{ title }}</h1>
  </div>
</template>
