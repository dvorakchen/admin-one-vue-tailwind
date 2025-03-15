import { serverApi } from "@/net/http";
import type { LoginRes } from "@/net/models";
import { defineStore } from "pinia";
import { ref } from "vue";

const AUTH_STORAGE_KEY = "auth_storage_key";
const LAST_LOGGED_IN_KEY = "lastLoggedIn";

const DURATION_CHECK_LOG_IN = 5_000;

type LastLoggedInInfo = {
  time: number;
  loggedIn: boolean;
};

export const useAuthStore = defineStore("auth-store", () => {
  const username = ref("Dvorak");

  const cache = localStorage.getItem(AUTH_STORAGE_KEY);
  if (cache !== null) {
    const loginInfo: LoginRes = JSON.parse(cache);
    username.value = loginInfo.username;
  }

  async function checkLoggedIn(): Promise<boolean> {
    const now = new Date().getTime();
    const latest = getLastLoggedIn();
    if (latest === null || !latest.loggedIn) {
      return false;
    }

    if (now - latest.time < DURATION_CHECK_LOG_IN) {
      return latest.loggedIn;
    }

    const resp = await serverApi.get("check-logged-in");
    const isCheckedLoggedIn = resp.status === 200;
    setLastLoggedIn({
      time: new Date().getTime(),
      loggedIn: isCheckedLoggedIn,
    });
    return isCheckedLoggedIn;
  }

  function setUser(loginInfo: LoginRes): void {
    if (loginInfo.username) {
      username.value = loginInfo.username;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loginInfo));
    setLastLoggedIn({
      time: new Date().getTime(),
      loggedIn: true,
    });
  }

  function getJwtToken(): string | null {
    const cache = localStorage.getItem(AUTH_STORAGE_KEY);
    if (cache) {
      return (JSON.parse(cache) as LoginRes).jwt_token;
    }
    return null;
  }

  function clearUser(): void {
    username.value = "";

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LAST_LOGGED_IN_KEY);
  }

  return {
    username,
    checkLoggedIn,
    setUser,
    getJwtToken,
    clearUser,
  };
});

function getLastLoggedIn(): LastLoggedInInfo | null {
  const value = localStorage.getItem(LAST_LOGGED_IN_KEY);
  if (value === null) {
    return null;
  }

  return JSON.parse(value);
}

function setLastLoggedIn(value: LastLoggedInInfo): void {
  localStorage.setItem(LAST_LOGGED_IN_KEY, JSON.stringify(value));
}
