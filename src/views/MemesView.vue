<script setup lang="ts">
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import { mdiFruitCherries, mdiEye, mdiTrashCan } from '@mdi/js'
import CardBox from '@/components/CardBox.vue'
import { ref, computed, onMounted } from 'vue'
import { useMainStore } from '@/stores/main.ts'
import format from 'date-format'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import { reactive } from 'vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import { useTemplateRef } from 'vue'
import { uploadImgs2Bed } from '@/net/superbed.ts'
import { http } from '@/net/http.ts'

const mainStore = useMainStore()

const memeList = ref([])

const selectOptions = [
  { id: 1, label: 'All' },
  { id: 2, label: 'Published' },
  { id: 3, label: 'Uncensored' },
  { id: 4, label: 'Deleted' }
]

const filter = reactive({
  status: selectOptions[0]
})

onMounted(queryList)

async function queryList() {
  const status = filter.status.label.toLowerCase() === 'all' ? '' : filter.status.label
  const resp = await http.get(`memes?page=1&status=${status}`)
  const data = JSON.parse(resp.data)

  currentPage.value = data.page

  memeList.value = data.list.map((item) => {
    return {
      checked: false,
      ...item
    }
  })
}

const actionBtnDisabled = computed(() => {
  return checkedList.value.size === 0
})

const items = computed(() => mainStore.clients)
const checkedList = ref(new Set([]))

const perPage = ref(5)
const isModalActive = ref(false)

const currentPage = ref(0)

const numPages = computed(() => Math.ceil(items.value.length / perPage.value))

const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }

  return pagesList
})

const checked = (isChecked: boolean, checkId: string) => {
  if (isChecked) {
    checkedList.value.add(checkId)
  } else {
    checkedList.value.delete(checkId)
  }
}

function checkedAll(ev: boolean): void {
  if (ev) {
    memeList.value.forEach((item: any) => {
      checkedList.value.add(item.id)
      item.checked = true
    })
  } else {
    checkedList.value.clear()
    memeList.value.forEach((item: any) => {
      item.checked = false
    })
  }
}

function handlePost(): void {
  isModalActive.value = true
}

const postFilesRef = useTemplateRef('postFilesRef')

const uploadFiles = ref([] as File[])

function handleSelectFiles(ev: Event): void {
  let ele = ev.target as HTMLInputElement

  for (const file of ele.files ?? []) {
    uploadFiles.value.push(file)
  }
}

function url(file: File): string {
  return URL.createObjectURL(file)
}

const uploading = ref(false)
async function handleUpload() {
  uploading.value = true

  if (uploadFiles.value.length <= 0) {
    return
  }

  const bedResult = await uploadImgs2Bed(uploadFiles.value)

  const postMemes = bedResult.urls.map((url) => {
    return {
      url: url,
      hash: '',
      bed_id: ''
    }
  })

  const res = await http.post('post-memes', {
    memes: postMemes
  })

  if (res.status === 200) {
    console.log('Post OK')
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal v-model="isModalActive" title="Post New Memes">
      <div
        class="w-full h-24 flex items-center content-center border border-blue-400 rounded p-2 cursor-pointer"
        @click="
          () => {
            postFilesRef.click()
          }
        "
      >
        选择图片
        <input
          type="file"
          multiple
          hidden
          ref="postFilesRef"
          accept=".jpg,.jpeg,.png,.gif"
          @change="handleSelectFiles"
        />
      </div>
      <div class="py-4 flex">
        <div class="w-16 h-16" v-for="file in uploadFiles" :key="file.name">
          <img class="w-full h-full object-contain" :src="url(file)" alt="" />
        </div>
      </div>
      <div>
        <BaseButton label="上传" @click="handleUpload" :disabled="uploading" />
      </div>
    </CardBoxModal>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiFruitCherries"
        title="Memes"
        main
      ></SectionTitleLineWithButton>
      <section class="mb-4">
        <h2>Filter:</h2>
        <div class="">
          <div class="flex">
            <FormField label="Status: " class="grow">
              <FormControl v-model="filter.status" :options="selectOptions" />
            </FormField>

            <BaseButton color="info" :icon="mdiEye" label="Query" @click="queryList" />
          </div>

          <div class="flex gap-2">
            <BaseButton color="info" :icon="mdiEye" label="Post" @click="handlePost" />
            <BaseButton color="warning" :icon="mdiEye" label="Pass" :disabled="actionBtnDisabled" />
            <BaseButton
              color="danger"
              :icon="mdiEye"
              label="Delete"
              :disabled="actionBtnDisabled"
            />
          </div>
        </div>
      </section>
      <section>
        <CardBox class="mb-6" has-table>
          <table>
            <thead>
              <tr>
                <th>
                  <TableCheckboxCell @checked="checkedAll($event)" />
                </th>
                <th>Preview</th>
                <th>Format</th>
                <th>Status</th>
                <th>Show At</th>
                <th>Created At</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="meme in memeList" :key="meme.id">
                <TableCheckboxCell @checked="checked($event, meme)" :checked="meme.checked" />
                <td class="border-b-0 lg:w-6 before:hidden">
                  <div class="relative w-16 h-16">
                    <img class="w-full h-full object-contain" :src="meme.url" alt="图片" />
                  </div>
                </td>
                <td data-label="Format">
                  {{ meme.format }}
                </td>
                <td data-label="Status">
                  {{ meme.status }}
                </td>
                <td data-label="Show At">
                  {{ format(format.ISO8601_WITH_TZ_OFFSET_FORMAT, new Date(meme.show_at)) }}
                </td>
                <td data-label="Created At">
                  {{ format(format.ISO8601_WITH_TZ_OFFSET_FORMAT, new Date(meme.created_at)) }}
                </td>

                <td class="before:hidden lg:w-1 whitespace-nowrap">
                  <BaseButtons type="justify-start lg:justify-end" no-wrap>
                    <BaseButton color="info" :icon="mdiEye" small @click="isModalActive = true" />
                    <BaseButton
                      color="danger"
                      :icon="mdiTrashCan"
                      small
                      @click="isModalDangerActive = true"
                    />
                  </BaseButtons>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
            <BaseLevel>
              <BaseButtons>
                <BaseButton
                  v-for="page in pagesList"
                  :key="page"
                  :active="page === currentPage"
                  :label="page + 1"
                  :color="page === currentPage ? 'lightDark' : 'whiteDark'"
                  small
                  @click="currentPage = page"
                />
              </BaseButtons>
              <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
            </BaseLevel>
          </div>
        </CardBox>
      </section>
    </SectionMain>
  </LayoutAuthenticated>
</template>
