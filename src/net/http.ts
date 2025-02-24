import axios, { AxiosHeaders, HttpStatusCode, type AxiosResponse } from 'axios'
import { encrypt, decrypt } from '@/cipher.ts'
import { useMainStore } from '@/stores/main.ts'

const TEXT_PLAIN = 'text/plain;charset=UTF-8'
const APPLICATION_JSON = 'application/json;charset=UTF-8'

const X_DATE = 'X-Date'

/**
 * keep Router
 */
let _router: any | null = null

/**
 * set router
 * @param router Router
 */
export function setRouter(router: any): void {
  _router = router
}

export const http = axios.create({
  baseURL: (import.meta as any).env.VITE_NET_BASE_URL,
  timeout: 10_000,
  validateStatus: function (status) {
    return status < 500
  }
})

http.interceptors.request.use(
  function (config) {
    config.data = encrypt(JSON.stringify(config.data))

    let token = useMainStore().get_jwt_token() ?? ''
    if (token) {
      config.headers.setAuthorization(`Bearer ${token}`)
    }

    config.headers.setContentType(TEXT_PLAIN, true)
    config.headers.set(X_DATE, new Date().toUTCString())

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  function (response: AxiosResponse<string, any>) {
    if (response.status === HttpStatusCode.Unauthorized) {
      // const router = useRouter()
      _router?.replace('/login')
    }

    let data = response.data
    response.data = decrypt(data)
    ;(response.headers as AxiosHeaders).setContentType(APPLICATION_JSON, true)

    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)
