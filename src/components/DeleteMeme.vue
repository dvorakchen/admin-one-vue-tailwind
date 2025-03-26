<script setup lang="ts">
import type { Meme } from "@/net/models";
import CategoryList from "./CategoryList.vue";
import { SuperBed, type Bed } from "@/net/bed";
import { ref } from "vue";
import { serverApi } from "@/net/http";
import ThumbnailList from "./ThumbnailList.vue";

const props = defineProps<{
  groups: Meme[];
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "afterDelete", success: Meme[], fail: Meme[]): void;
}>();

const loading = ref(false);
const isPreview = ref(false);

function handleCancel() {
  emit("cancel");
}

async function handleDelete() {
  loading.value = true;
  const bed: Bed = new SuperBed();

  const success = [];
  const fail = [];

  for (const meme of props.groups) {
    if (await deleteSingle(bed, meme)) {
      success.push(meme);
    } else {
      fail.push(meme);
    }
  }

  loading.value = false;
  emit("afterDelete", success, fail);
}

async function deleteSingle(bed: Bed, meme: Meme): Promise<boolean> {
  // delete from server
  const resp = await serverApi.delete(`memes/${meme.id}`);
  if (resp.status !== 200) {
    return false;
  }

  // delete from bed
  const urls = meme.list
    .flatMap((t) => [t.url, t.cover])
    .filter((t) => t !== "");
  await bed.deleteImagesFromUrl(urls);

  return true;
}
</script>

<template>
  <main class="relative flex flex-col gap-4">
    <h1 class="text-error text-xl">
      Delete Meme(s)
      <label class="cursor-pointer font-semibold text-sm text-neutral ml-4">
        Preview:
        <input
          type="checkbox"
          class="toggle toggle-primary ml-1"
          v-model="isPreview"
        />
      </label>
    </h1>
    <section class="flex flex-wrap gap-4">
      <div
        class="flex flex-col gap-1 w-auto border p-2 rounded-xl border-primary"
        v-for="group in groups"
        :key="group.id"
      >
        <CategoryList :list="group.categories" />
        <ThumbnailList
          :imgUrls="group.list.map((t) => t.url)"
          :preview="isPreview"
        />
      </div>
    </section>
    <div class="flex gap-2 justify-end">
      <button class="btn btn-neutral" @click="handleCancel" :disabled="loading">
        Cantel
      </button>
      <button class="btn btn-error" @click="handleDelete" :disabled="loading">
        <span class="loading" v-show="loading"></span>
        Delete!
      </button>
    </div>
    <div
      class="absolute inset-0 flex items-center justify-center bg-base-100/50"
      v-show="loading"
    ></div>
  </main>
</template>
