<script lang="ts" setup>
import Icon from "@/components/Icon.vue";
import { useAuthStore } from "@/stores/auth";
import { mdiCardAccountDetailsOutline, mdiKeyOutline, mdiLogin } from "@mdi/js";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import bcypt from "bcryptjs";
import { blake3 } from "@noble/hashes/blake3";
import aesjs from "aes-js";
import { serverApi } from "@/net/http";
import { useMsgStore } from "@/stores/msg";
import { type LoginRes } from "@/net/models";

const isLoading = ref(false);
const userStore = useAuthStore();
const msgStore = useMsgStore();

const router = useRouter();

const form = reactive({
  account: "",
  pwd: "",
});

onMounted(() => {
  userStore.clearUser();
});

async function handleLogin() {
  isLoading.value = true;

  form.account = form.account.trim();
  form.pwd = form.pwd.trim();

  let hashed_password = aesjs.utils.hex.fromBytes(blake3(form.pwd.trim()));
  hashed_password = bcypt.hashSync(hashed_password, 12);

  const res = await serverApi.post("login", {
    username: form.account,
    hashed_password: hashed_password,
  });

  let errorMsg = "";
  switch (res.status) {
    case 200:
      {
        const data: LoginRes = JSON.parse(res.data);
        userStore.setUser(data);
        await router.push("home");
      }
      break;
    case 204:
      {
        errorMsg = `用户不存在: ${form.account}`;
      }
      break;
    case 400:
      {
        errorMsg = "账号密码有误";
      }
      break;
    case 401:
      {
        errorMsg = "密码错误";
      }
      break;
    default:
      {
        errorMsg = "服务器发生错误";
      }
      break;
  }

  isLoading.value = false;
  if (errorMsg) {
    msgStore.pushMsg({
      color: "warning",
      value: errorMsg,
    });
  } else {
    router.push("/");
  }
}
</script>

<template>
  <main class="h-screen w-screen flex place-items-center place-content-center">
    <div
      class="flex flex-col w-auto bg-base-100 rounded-2xl shadow-2xl -mt-28 px-8 pt-4 pb-16"
    >
      <h1 class="text-xl text-center font-bold my-4">Log In</h1>
      <form class="flex flex-col gap-2 w-80" @submit.prevent="handleLogin">
        <div>
          <label class="input validator">
            <Icon :d="mdiCardAccountDetailsOutline" />
            <input
              v-model="form.account"
              class=""
              required
              placeholder="Account"
              minlength="6"
              title="Please input the account"
            />
          </label>
          <p class="validator-hint">Please input the account</p>
        </div>
        <div>
          <label class="input validator">
            <Icon :d="mdiKeyOutline" />
            <input
              v-model="form.pwd"
              type="password"
              class="password"
              required
              placeholder="Account"
              minlength="6"
              title="Please input the password"
            />
          </label>
          <p class="validator-hint">Please input the password</p>
        </div>
        <div>
          <button
            class="btn btn-primary w-full"
            type="submit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading"> </span>
            <Icon :d="mdiLogin" v-else />
            Log In
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
main {
  background-image: url("/src/assets/login-bg.svg");
}
</style>
