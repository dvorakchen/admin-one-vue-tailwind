<script lang="ts" setup>
import TitleBar from "@/components/TitleBar.vue";
import { serverApi } from "@/net/http";
import type { Meme, Pagination } from "@/net/models";
import { mdiEmoticonLol } from "@mdi/js";
import { onMounted, reactive, ref, useTemplateRef, watch, computed } from "vue";
import PaginationComponent from "@/components/Pagination.vue";
import PostMemes from "@/components/post-memes/Index.vue";
import { useMsgStore } from "@/stores/msg";
import DeleteMeme from "@/components/DeleteMeme.vue";
import ThumbnailList from "@/components/ThumbnailList.vue";
import PostDetail from "@/components/PostDetail.vue";
import clone from "clone";

enum FilterStatus {
  Uncensored = "Uncensored",
  Published = "Published",
  Deleted = "Deleted",
}

type MemeItem = { checked: boolean } & Meme;

const msgStore = useMsgStore();

const postDialog = useTemplateRef("dialog_post_memes_in_meme_list");
const deleteDialog = useTemplateRef("dialog_delete_meme_in_meme_list");
const detailDialog = useTemplateRef("dialog_post_detail");
const isLoading = ref(false);
const isPreview = ref(false);
const page = ref(1);
const size = 20;
const total = ref(1);

const detailMeme = ref(null as Meme | null);

const list = ref([] as MemeItem[]);

const checkedItems = computed(() => {
  return list.value.filter((t) => t.checked);
});

const hasCheckedItems = computed(() => {
  return checkedItems.value.length !== 0;
});

const filter = reactive({
  status: "All",
});

onMounted(nextPage);

watch(page, async () => {
  await nextPage();
});

async function nextPage() {
  isLoading.value = true;

  const selectedStatus = Object.values(FilterStatus).some(
    (t) => t === filter.status
  )
    ? filter.status
    : "";

  const resp = await serverApi.get(`memes`, {
    params: {
      page: page.value,
      size,
      status: selectedStatus,
    },
  });

  try {
    const data: Pagination<Meme> = JSON.parse(resp.data);
    page.value = data.page;
    total.value = data.total;
    list.value = data.list.map((item) => {
      return {
        checked: false,
        ...item,
      } as MemeItem;
    });
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

async function handleQuery() {
  await nextPage();
}

function handlePost() {
  postDialog.value?.showModal();
}

function handleDelete() {
  deleteDialog.value?.showModal();
}

function handleSelectAll(ev: Event) {
  const ele = ev.target as HTMLInputElement;
  list.value.forEach((item) => (item.checked = ele.checked));
}

function handlePaginationChange(value: number) {
  if (value === page.value) {
    return;
  }
  page.value = value;
}

async function handleAfterPost() {
  postDialog.value?.close();
  msgStore.pushMsg({
    color: "success",
    value: "提交成功",
  });
  await nextPage();
}

function handleCancelPost() {
  postDialog.value?.close();
}

async function handleAfterDelete(success: Meme[], fail: Meme[]) {
  if (success.length > 0) {
    msgStore.pushMsg({
      color: "success",
      value: `Deleted ${success.length} Meme(s)`,
    });
  }

  if (fail.length > 0) {
    msgStore.pushMsg({
      color: "error",
      value: `Delete ${fail.length} Meme(s) failed`,
    });
  }

  deleteDialog.value?.close();
  await nextPage();
}

function handleCancelDelete() {
  deleteDialog.value?.close();
}

function showDetail(id: string) {
  detailMeme.value = list.value.find((t) => t.id === id) ?? null;
  detailDialog.value!.checked = true;
}

function handleAfterUpdate(meme: Meme) {
  detailMeme.value!.categories = meme.categories;
  msgStore.pushMsg({ color: "success", value: "更新成功" });
  detailDialog.value!.checked = false;
}

function handleCancelDetail() {
  detailMeme.value = null;
  detailDialog.value!.checked = false;
}
</script>

<template>
  <div class="flex flex-col justify-center">
    <TitleBar :icon="mdiEmoticonLol" title="Meme" />
    <main class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <h2 class="font-semibold text-xl">Filter:</h2>
        <div class="space-4">
          <label class="select w-52">
            <span class="label">Status</span>
            <select v-model="filter.status">
              <option selected>All</option>
              <option v-for="status in FilterStatus">
                {{ status }}
              </option>
            </select>
          </label>
        </div>
        <div>
          <label class="cursor-pointer font-semibold">
            Preview:
            <input
              type="checkbox"
              class="toggle toggle-primary ml-1"
              v-model="isPreview"
            />
          </label>
        </div>
        <div class="space-x-2">
          <button
            class="btn btn-primary btn-sm"
            :disabled="isLoading"
            @click="handleQuery"
          >
            Query
          </button>
          <button class="btn btn-accent btn-sm" @click="handlePost">
            Post
          </button>
          <button
            class="btn btn-warning btn-sm"
            @click="handleDelete"
            :disabled="!hasCheckedItems"
          >
            Delete
          </button>
        </div>
      </div>

      <PaginationComponent
        :page="page"
        :total="total"
        :loading="isLoading"
        @click="handlePaginationChange"
      />

      <div class="overflow-auto">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary"
                    @change="handleSelectAll"
                  />
                </label>
              </th>
              <th>Preview</th>
              <th>Categories</th>
              <th>Status</th>
              <th>Show At</th>
              <th>Created At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="meme in list">
              <th>
                <label>
                  <input
                    type="checkbox"
                    class="checkbox"
                    v-model="meme.checked"
                  />
                </label>
              </th>
              <td>
                <ThumbnailList
                  :imgUrls="meme.list.map((t) => t.url)"
                  :preview="isPreview"
                />
              </td>
              <td>
                <ul class="space-y-1">
                  <li v-for="cate in meme.categories">
                    <span class="badge badge-primary text-nowrap">{{
                      cate
                    }}</span>
                  </li>
                </ul>
              </td>
              <td>
                <span class="badge badge-info">Published</span>
              </td>
              <td>
                <input
                  class="input input-ghost"
                  :value="meme.show_date_time"
                  disabled
                />
              </td>
              <td>
                <input
                  class="input input-ghost"
                  value="2025-03-13 19:12"
                  disabled
                />
              </td>
              <th>
                <button
                  class="btn btn-ghost btn-xs"
                  @click="showDetail(meme.id)"
                >
                  details
                </button>
              </th>
            </tr>
          </tbody>
          <!-- foot -->
          <tfoot>
            <tr>
              <th></th>
              <th>Preview</th>
              <th>Categories</th>
              <th>Status</th>
              <th>Show At</th>
              <th>Created At</th>
              <th></th>
            </tr>
          </tfoot>
        </table>

        <PaginationComponent
          :page="page"
          :total="total"
          :loading="isLoading"
          @click="handlePaginationChange"
        />
      </div>
    </main>

    <dialog ref="dialog_post_memes_in_meme_list" class="modal">
      <div
        class="modal-box w-full md:w-11/12 max-w-5xl h-full min-h-96 md:h-auto"
      >
        <PostMemes @afterPost="handleAfterPost" @cancel="handleCancelPost" />
      </div>
    </dialog>

    <dialog ref="dialog_delete_meme_in_meme_list" class="modal">
      <div class="modal-box w-auto md:w-xl max-w-full">
        <DeleteMeme
          :groups="checkedItems"
          @cancel="handleCancelDelete"
          @afterDelete="handleAfterDelete"
        />
      </div>
    </dialog>

    <input
      type="checkbox"
      id="dialog_post_detail"
      ref="dialog_post_detail"
      class="modal-toggle"
    />
    <div class="modal" role="dialog" v-if="detailMeme !== null">
      <div class="modal-box">
        <PostDetail
          :meme="clone(detailMeme)"
          @afterUpdate="handleAfterUpdate"
          @cancel="handleCancelDetail"
        />
      </div>
      <label class="modal-backdrop" for="dialog_post_detail">Close</label>
    </div>
  </div>
</template>
