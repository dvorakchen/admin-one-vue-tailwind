<script setup lang="ts">
import { useMainStore } from '@/stores/main.ts'
import UserAvatar from '@/components/UserAvatar.vue'

const mainStore = useMainStore()
</script>

<template>
  <UserAvatar :username="mainStore.username" :avatar="mainStore.userAvatar">
    <slot />
  </UserAvatar>
</template>
