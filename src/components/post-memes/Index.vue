<script setup lang="ts">
import { mdiImagePlus } from "@mdi/js";
import Icon from "../Icon.vue";
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { DefaultCategory } from "./models";
import { type FileGroup, FileItem } from "@/net/meme";
import CollectionViewer from "./CollectionViewer.vue";
import { getAllCategories } from "@/net/category";
import { postMemes as serverPostMemes } from "@/net/meme";
import { useMsgStore } from "@/stores/msg";

function preventBodyDropEvent(ev: DragEvent) {
  ev.preventDefault();
}

const emit = defineEmits<{
  (e: "afterPost"): void;
  (e: "cancel"): void;
}>();

onMounted(async () => {
  document.body.addEventListener("drop", preventBodyDropEvent);
  document.body.addEventListener("dragover", preventBodyDropEvent);
  await getAllCategories();
});

onUnmounted(() => {
  document.body.removeEventListener("drop", preventBodyDropEvent);
  document.body.removeEventListener("dragover", preventBodyDropEvent);
});

const msgStore = useMsgStore();
const canvas = useTemplateRef("clip-cover-canvas");
const fileInput = useTemplateRef("file-input");
const fileGroups = ref([] as FileGroup[]);
const loading = ref(false);

const isEmptyFileGroups = computed(() => {
  return fileGroups.value.length === 0;
});

function handleClickUpload() {
  fileInput.value?.click();
}

function handleOnDrop(ev: DragEvent) {
  const files = ev.dataTransfer?.files ?? new FileList();
  for (const file of files) {
    fileGroups.value.push({
      id: Math.random(),
      categories: DefaultCategory.value,
      files: [new FileItem(Math.random(), file, null)],
    } as FileGroup);
  }
}

function handleCollectionChange(newFileGroups: FileGroup[]): void {
  newFileGroups = newFileGroups.filter((t) => t.files.length !== 0);
  fileGroups.value = newFileGroups;
}

function handleSelectFilesChange(ev: Event) {
  const files = (ev.target as HTMLInputElement).files ?? new FileList();
  for (const file of files) {
    fileGroups.value.push({
      id: Math.random(),
      categories: DefaultCategory.value,
      files: [new FileItem(Math.random(), file, null)],
    } as FileGroup);
  }

  (ev.target as HTMLInputElement).files = null;
}

async function handlePost() {
  loading.value = true;

  const res = await serverPostMemes(fileGroups.value, canvas.value!);
  if (res) {
    emit("afterPost");
  } else {
    msgStore.pushMsg({
      color: "error",
      value: "提交失败",
    });
  }

  loading.value = false;
}

function handleCancel() {
  fileGroups.value = [];
  emit("cancel");
}
</script>

<template>
  <div class="relative flex flex-col gap-4 min-h-[inherit]">
    <h3 class="text-lg font-bold">Post New Meme(s)</h3>
    <div class="flex grow flex-col">
      <!-- drag and drop -->
      <div class="w-auto h-32 rounded-2xl border border-primary p-2">
        <div
          class="hover:bg-base-300 flex flex-col items-center justify-center h-full rounded-2xl cursor-pointer"
          @click="handleClickUpload"
          @drop.prevent="handleOnDrop"
          @dragover.prevent=""
        >
          <Icon :d="mdiImagePlus" :size="50" />
          <h1>Drag and Drop or Click to select images</h1>
        </div>
        <input
          ref="file-input"
          type="file"
          multiple
          hidden
          accept=".jpg,.jpeg,.png,.gif,.webp,.webm"
          @change="handleSelectFilesChange"
        />
      </div>

      <!-- Viewer -->
      <div>
        <CollectionViewer
          :fileGroups="fileGroups"
          @change="handleCollectionChange"
        />
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <button class="btn btn-accent" @click="handleCancel" :disabled="loading">
        Cancel
      </button>
      <button
        class="btn bg-primary"
        @click="handlePost"
        :disabled="loading || isEmptyFileGroups"
      >
        Post
      </button>
    </div>
    <div
      class="absolute inset-0 bg-base-300/50 rounded-xl flex items-center justify-center"
      v-show="loading"
    >
      <span class="loading loading-xl text-primary"></span>
    </div>
  </div>

  <canvas ref="clip-cover-canvas" hidden> </canvas>
</template>
