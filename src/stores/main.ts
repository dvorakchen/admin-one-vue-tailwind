import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { type LogInRes } from '@/net/models.ts'

const AUTH_STORAGE_KEY = 'auth_storage_key'

export const useMainStore = defineStore('main', () => {
  const username = ref('')
  const email = ref('')

  const cache = localStorage.getItem(AUTH_STORAGE_KEY)
  if (cache !== null) {
    const logInInfo: LogInRes = JSON.parse(cache)
    username.value = logInInfo.username
    email.value = logInInfo.email
  }

  const userAvatar = computed(
    () =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.value.replace(/[^a-z0-9]+/gi, '-')}`
  )

  const isLoggedIn = computed(() => {
    return Boolean(username.value)
  })

  const isFieldFocusRegistered = ref(false)

  const clients = ref([])
  const history = ref([])

  function setUser(payload: LogInRes): void {
    if (payload.username) {
      username.value = payload.username
    }
    if (payload.email) {
      email.value = payload.email
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
  }

  function get_jwt_token(): string | null {
    const cache = localStorage.getItem(AUTH_STORAGE_KEY)
    if (cache) {
      return JSON.parse(cache).jwt_token
    }
    return null
  }

  function clearUser(): void {
    username.value = ''
    email.value = ''

    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  function fetchSampleClients() {
    axios
      .get(`data-sources/clients.json?v=3`)
      .then((result) => {
        clients.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchSampleHistory() {
    axios
      .get(`data-sources/history.json`)
      .then((result) => {
        history.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  return {
    username,
    email,
    userAvatar,
    isLoggedIn,
    isFieldFocusRegistered,
    clients,
    history,
    setUser,
    get_jwt_token,
    clearUser,
    fetchSampleClients,
    fetchSampleHistory
  }
})
