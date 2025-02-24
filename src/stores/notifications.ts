import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Notification = {
  color: 'info' | 'success' | 'warning' | 'danger' | 'contrast'
  message: string
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([] as Notification[])

  function push(newNotification: Notification): void {
    notifications.value.push(newNotification)
  }

  return {
    notifications,
    push
  }
})
