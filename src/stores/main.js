import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useMainStore = defineStore('main', () => {
  const userName = ref('')
  const userEmail = ref('')

  const userAvatar = computed(
    () =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail.value.replace(
        /[^a-z0-9]+/gi,
        '-'
      )}`
  )

  const isLoggedIn = computed(() => {
    return userName.value !== ''
  })

  const isFieldFocusRegistered = ref(false)

  const clients = ref([])
  const history = ref([])

  function setUser(payload) {
    if (payload.username) {
      userName.value = payload.username
    }
    if (payload.email) {
      userEmail.value = payload.email
    }
  }

  function clearUser() {
    userName.value = ''
    userEmail.value = ''
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
    userName,
    userEmail,
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
