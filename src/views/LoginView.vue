<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiAccount, mdiAsterisk } from '@mdi/js'
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import { http } from '@/net/http.ts'
import { useMainStore } from '@/stores/main.ts'
import bcypt from 'bcryptjs'
import { blake3 } from '@noble/hashes/blake3'
import aesjs from 'aes-js'

const mainStore = useMainStore()
onMounted(async () => {
  //  clean auth
  mainStore.clearUser()
})

const loading = ref(false)

const form = reactive({
  login: 'dvorak',
  pass: '',
  remember: true
})

const router = useRouter()

const submit = async () => {
  if (form.login.trim() === '' || form.pass.trim() === '') {
    return
  }

  let hashed_password = aesjs.utils.hex.fromBytes(blake3(form.pass.trim()))
  hashed_password = bcypt.hashSync(hashed_password, 12)

  console.log(hashed_password)

  loading.value = true
  const res = await http.post('login', {
    username: form.login,
    hashed_password: hashed_password
  })
  switch (res.status) {
    case 200:
      {
        const data = JSON.parse(res.data)
        const mainStore = useMainStore()
        mainStore.setUser(data)

        await router.push('/dashboard')
      }
      break
    case 204:
      {
        console.warn('用户不存在: ', form.login)
      }
      break
    case 400:
      {
        console.warn('账号密码格式有误')
      }
      break
    case 401:
      {
        console.warn('密码错误')
      }
      break
    default:
      {
        console.error('服务器发生错误')
      }
      break
  }
  loading.value = false
  //
}
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
        <FormField label="Login" help="Please enter your login">
          <FormControl
            v-model="form.login"
            :icon="mdiAccount"
            name="login"
            autocomplete="username"
          />
        </FormField>

        <FormField label="Password" help="Please enter your password">
          <FormControl
            v-model="form.pass"
            :icon="mdiAsterisk"
            type="password"
            name="password"
            autocomplete="current-password"
          />
        </FormField>

        <FormCheckRadio
          v-model="form.remember"
          name="remember"
          label="Remember"
          :input-value="true"
        />

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Login" :disabled="loading" />
            <!-- <BaseButton to="/dashboard" color="info" outline label="Back" /> -->
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
