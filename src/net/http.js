import axios from 'axios'
import { encrypt, decrypt } from '@/cipher'

const TEXT_PLAIN = 'text/plain;charset=UTF-8'
const APPLICATION_JSON = 'application/json;charset=UTF-8'

export const http = axios.create({
  baseURL: import.meta.env.VITE_NET_BASE_URL,
  timeout: 10_000
})

http.interceptors.request.use(
  function (config) {
    config.data = encrypt(JSON.stringify(config.data))
    config.headers.setContentType(TEXT_PLAIN, true)
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  function (response) {
    let data = response.data
    response.data = decrypt(data)
    response.headers.setContentType(APPLICATION_JSON, true)

    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)
