import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useMainStore = defineStore('main', () => {
  const username = ref('')
  const email = ref('')

  const userAvatar = computed(
    () =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.value.replace(/[^a-z0-9]+/gi, '-')}`
  )

  const isLoggedIn = computed(() => {
    return username.value !== ''
  })

  const isFieldFocusRegistered = ref(false)

  const clients = ref([])
  const history = ref([])

  function setUser(payload: any) {
    if (payload.username) {
      username.value = payload.username
    }
    if (payload.email) {
      email.value = payload.email
    }
  }

  function clearUser() {
    username.value = ''
    email.value = ''
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
    clearUser,
    fetchSampleClients,
    fetchSampleHistory
  }
})
