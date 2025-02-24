<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationBar from '@/components/NotificationBar.vue'
import { useNotificationStore } from '@/stores/notifications.ts'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { setRouter } from '@/net/http.ts'

const notifiStore = useNotificationStore()
const router = useRouter()

onMounted(() => {
  setRouter(router)
})
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
