<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationBar from '@/components/NotificationBar.vue'
import { useNotificationStore } from '@/stores/notifications.ts'

const notifiStore = useNotificationStore()
</script>

<template>
  <!-- Notifications -->
  <div class="fixed top-16 right-8 z-40 flex flex-col gap-2">
    <div v-for="notifi in notifiStore.notifications">
      <NotificationBar :color="notifi.color">
        <b class="mr-2">{{ notifi.message }}</b>
      </NotificationBar>
    </div>
  </div>
  <RouterView />
</template>
