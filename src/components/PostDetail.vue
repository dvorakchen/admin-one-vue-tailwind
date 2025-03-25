<script setup lang="ts">
import type { Meme } from "@/net/models";
import ThumbnailList from "./ThumbnailList.vue";
import { computed, ref } from "vue";
import CategoryList from "./CategoryList.vue";
import { updateCategory } from "@/net/category";

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "afterUpdate", meme: Meme): void;
}>();

const props = defineProps<{
  meme: Meme;
}>();

const meme = ref(props.meme);

const preview = ref(false);

const imgUrls = computed(() => {
  return meme.value.list.map((t) => t.url);
});

const categories = computed(() => {
  return meme.value.categories;
});

function handleCategoryChange(_groupId: number, list: string[]) {
  meme.value.categories = list;
}

function handleCancel() {
  emit("cancel");
}

async function handleUpdate() {
  await updateCategory(meme.value.id, meme.value.categories);

  emit("afterUpdate", meme.value);
}
</script>

<template>
  <div class="flex flex-col gap-4 flex-wrap">
    <label class="cursor-pointer font-semibold text-sm text-neutral ml-4">
      Preview:
      <input
        type="checkbox"
        class="toggle toggle-primary ml-1"
        v-model="preview"
      />
    </label>
    <ThumbnailList :imgUrls="imgUrls" :preview="preview" />
    <CategoryList
      :list="categories"
      :allowAction="true"
      @change="handleCategoryChange"
    />
    <div class="flex justify-end gap-4">
      <button class="btn btn-secondary" @click="handleCancel">Cancel</button>
      <button class="btn btn-primary" @click="handleUpdate">Update</button>
    </div>
  </div>
</template>
