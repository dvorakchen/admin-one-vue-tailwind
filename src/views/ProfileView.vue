<script setup lang="ts">
import { reactive } from 'vue'
import { useMainStore } from '@/stores/main.ts'
import { mdiAccount, mdiMail, mdiAsterisk, mdiFormTextboxPassword, mdiGithub } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import FormFilePicker from '@/components/FormFilePicker.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import UserCard from '@/components/UserCard.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import { z } from 'zod'
import { useNotificationStore } from '@/stores/notifications.ts'
import { http } from '@/net/http.ts'
import { ChangePwdReq } from '@/net/models.ts'
import { blake3 } from '@noble/hashes/blake3'
import aesjs from 'aes-js'
import bcrypt from 'bcryptjs'

const mainStore = useMainStore()
const notifiStore = useNotificationStore()

const profileForm = reactive({
  username: mainStore.username,
  email: mainStore.email
})

const passwordForm = reactive({
  password_current: '',
  password: '',
  password_confirmation: ''
})

const submitProfile = () => {
  mainStore.setUser(profileForm)
}

const pwdValidator = z.object({
  password_current: z.string().min(6),
  password: z.string().min(6),
  password_confirmation: z.string().min(6)
})

const submitPass = async () => {
  passwordForm.password_current = passwordForm.password_current.trim()
  passwordForm.password = passwordForm.password.trim()
  passwordForm.password_confirmation = passwordForm.password_confirmation.trim()

  let res = pwdValidator.safeParse(passwordForm)
  if (!res.success || passwordForm.password !== passwordForm.password_confirmation) {
    notifiStore.push({
      color: 'warning',
      message: '密码长度至少 6 位，或者密码有误'
    })
    return
  }

  let hashed_password_cur = aesjs.utils.hex.fromBytes(blake3(passwordForm.password_current.trim()))
  hashed_password_cur = bcrypt.hashSync(hashed_password_cur, 12)

  let hashed_password_new = aesjs.utils.hex.fromBytes(blake3(passwordForm.password.trim()))

  const resp = await http.put('change-password', {
    hashed_password_current: hashed_password_cur,
    hashed_password_new: hashed_password_new
  } as ChangePwdReq)

  switch (resp.status) {
    case 200:
      notifiStore.push({ color: 'success', message: '修改成功' })
      break
    default:
      break
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiAccount" title="Profile" main>
        <BaseButton
          href="https://github.com/justboil/admin-one-vue-tailwind"
          target="_blank"
          :icon="mdiGithub"
          label="Star on GitHub"
          color="contrast"
          rounded-full
          small
        />
      </SectionTitleLineWithButton>

      <UserCard class="mb-6" />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardBox is-form @submit.prevent="submitProfile">
          <FormField label="Avatar" help="Max 500kb">
            <FormFilePicker label="Upload" />
          </FormField>

          <FormField label="Name" help="Your name">
            <FormControl
              v-model="profileForm.username"
              :icon="mdiAccount"
              name="username"
              :disabled="true"
              autocomplete="username"
            />
          </FormField>
          <FormField label="E-mail" help="Required. Your e-mail">
            <FormControl
              v-model="profileForm.email"
              :icon="mdiMail"
              type="email"
              name="email"
              required
              autocomplete="email"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton color="info" type="submit" label="Submit" />
              <BaseButton color="info" label="Options" outline />
            </BaseButtons>
          </template>
        </CardBox>

        <CardBox is-form @submit.prevent="submitPass">
          <FormField label="Current password" help="Required. Your current password">
            <FormControl
              v-model="passwordForm.password_current"
              :icon="mdiAsterisk"
              name="password_current"
              type="password"
              required
              autocomplete="current-password"
            />
          </FormField>

          <BaseDivider />

          <FormField label="New password" help="Required. New password">
            <FormControl
              v-model="passwordForm.password"
              :icon="mdiFormTextboxPassword"
              name="password"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <FormField label="Confirm password" help="Required. New password one more time">
            <FormControl
              v-model="passwordForm.password_confirmation"
              :icon="mdiFormTextboxPassword"
              name="password_confirmation"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Submit" />
              <BaseButton color="info" label="Options" outline />
            </BaseButtons>
          </template>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
