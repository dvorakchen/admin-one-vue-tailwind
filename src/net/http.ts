import axios, { AxiosHeaders, HttpStatusCode, type AxiosResponse } from "axios";
import { encrypt, decrypt } from "@/utils/cipher";
import { useAuthStore } from "@/stores/auth";

const TEXT_PLAIN = "text/plain;charset=UTF-8";
const APPLICATION_JSON = "application/json;charset=UTF-8";

const X_DATE = "X-Date";

export const serverApi = axios.create({
  baseURL: (import.meta as any).env.VITE_NET_BASE_URL,
  timeout: 10_000,
  validateStatus: function (status) {
    return status < 500;
  },
});

serverApi.interceptors.request.use(
  function (config) {
    let data = JSON.stringify(config.data);
    if ((data?.length ?? 0) !== 0) {
      config.data = encrypt(data);
    }

    let token = useAuthStore().getJwtToken() ?? "";
    if (token) {
      config.headers.setAuthorization(`Bearer ${token}`);
    }

    config.headers.setContentType(TEXT_PLAIN, true);
    config.headers.set(X_DATE, new Date().toUTCString());

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

serverApi.interceptors.response.use(
  function (response: AxiosResponse<string, any>) {
    if (response.status === HttpStatusCode.Unauthorized) {
      location.href = "/#/login";
      return response;
    }

    let data = response.data;
    if ((data?.length ?? 0) !== 0) {
      response.data = decrypt(data);
    }

    (response.headers as AxiosHeaders).setContentType(APPLICATION_JSON, true);

    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
