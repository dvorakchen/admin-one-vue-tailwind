<script setup lang="ts">
import TitleBar from "@/components/TitleBar.vue";
import {
  mdiFaceManProfile,
  mdiFormTextboxPassword,
  mdiKeyOutline,
  mdiLockReset,
} from "@mdi/js";
import Icon from "@/components/Icon.vue";
import { reactive, ref } from "vue";
import { blake3 } from "@noble/hashes/blake3";
import aesjs from "aes-js";
import bcrypt from "bcryptjs";
import type { ChangePwdReq } from "@/net/models";
import { serverApi } from "@/net/http";
import { useMsgStore } from "@/stores/msg";

const msgStore = useMsgStore();

const isLoading = ref(false);

const passwordForm = reactive({
  curPwd: "",
  newPwd: "",
  confirmPwd: "",
});

async function handleSubmit() {
  isLoading.value = true;

  passwordForm.curPwd = passwordForm.curPwd.trim();
  passwordForm.newPwd = passwordForm.newPwd.trim();
  passwordForm.confirmPwd = passwordForm.newPwd.trim();

  let hashed_password_cur = aesjs.utils.hex.fromBytes(
    blake3(passwordForm.curPwd.trim())
  );
  hashed_password_cur = bcrypt.hashSync(hashed_password_cur, 12);

  let hashed_password_new = aesjs.utils.hex.fromBytes(
    blake3(passwordForm.newPwd.trim())
  );

  const resp = await serverApi.put("change-password", {
    hashed_password_current: hashed_password_cur,
    hashed_password_new: hashed_password_new,
  } as ChangePwdReq);

  switch (resp.status) {
    case 200:
      msgStore.pushMsg({ color: "success", value: "修改成功" });
      break;
    default:
      msgStore.pushMsg({ color: "warning", value: "修改失败" });
      break;
  }

  isLoading.value = false;

  return false;
}
</script>

<template>
  <div class="flex flex-col justify-center">
    <TitleBar :icon="mdiFaceManProfile" title="Profile" />
    <div>
      <form
        class="p-8 rounded-2xl bg-base-100 shadow-xl flex flex-col w-lg"
        @submit.prevent="handleSubmit"
      >
        <div class="w-full">
          <h1 class="text-2xl font-bold my-4">Change Password</h1>
          <div class="flex flex-col">
            <span class="font-bold mb-2">Current Password </span>
            <label class="input validator">
              <span>
                <Icon :d="mdiKeyOutline" />
              </span>
              <input
                v-model="passwordForm.curPwd"
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

          <div class="flex flex-col mt-8">
            <span class="font-bold mb-2">New Password </span>
            <label class="input validator">
              <span>
                <Icon :d="mdiFormTextboxPassword" />
              </span>
              <input
                v-model="passwordForm.newPwd"
                type="password"
                class="password"
                required
                placeholder="New Password"
                minlength="6"
                title="Please input the New Password"
              />
            </label>
            <p class="validator-hint">Please input the New Password</p>
          </div>
          <div class="flex flex-col">
            <span class="font-bold mb-2">Confirm Password </span>
            <label class="input validator">
              <span>
                <Icon :d="mdiFormTextboxPassword" />
              </span>
              <input
                v-model="passwordForm.confirmPwd"
                type="password"
                class="password"
                required
                placeholder="Confirm Password"
                minlength="6"
                title="Please confirm the New Password"
              />
            </label>
            <p class="validator-hint">Please confirm the New Password</p>
          </div>

          <div class="mt-4">
            <button class="btn btn-primary" type="submit" :disabled="isLoading">
              <span class="loading" v-if="isLoading"> </span>
              <Icon :d="mdiLockReset" v-else />
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
