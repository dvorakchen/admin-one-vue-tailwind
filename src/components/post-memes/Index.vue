<script setup lang="ts">
import { mdiImagePlus } from "@mdi/js";
import Icon from "../Icon.vue";
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { getDefaultCategories, FileItem, type FileGroup } from "./models";
import { type PostMemeGroup, type PostMeme } from "@/net/models";
import CollectionViewer from "./CollectionViewer.vue";
import { getAllCategories } from "@/net/category";
import { SuperBed, type Bed } from "@/net/bed";
import { getFileExtension } from "@/utils/file";
import { blake3 } from "@noble/hashes/blake3";
import aesjs from "aes-js";
import { serverApi } from "@/net/http";
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
  await getAllCategories();
});

onUnmounted(() => {
  document.body.removeEventListener("drop", preventBodyDropEvent);
});

const msgStore = useMsgStore();
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
      categories: getDefaultCategories(),
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
      categories: getDefaultCategories(),
      files: [new FileItem(Math.random(), file, null)],
    } as FileGroup);
  }

  (ev.target as HTMLInputElement).files = null;
}

async function handlePost() {
  loading.value = true;

  const bed: Bed = new SuperBed();

  const waitGroups = fileGroups.value.map((group) => {
    const waitGroup = {
      categories: group.categories,
      message: "",
      waitingMemes: group.files.map((file) => {
        return postImg2Bed(bed, file.file);
      }),
      memes: [] as PostMeme[],
    };
    return waitGroup;
  });

  for (const group of waitGroups) {
    group.memes = await Promise.all(group.waitingMemes);
  }

  const groups = waitGroups.map((group) => {
    return {
      categories: group.categories,
      message: group.message,
      memes: group.memes,
    } as PostMemeGroup;
  });

  const res = await serverApi.post("post-memes", groups);
  if (res.status !== 200) {
    console.error("上传服务器失败");
    msgStore.pushMsg({
      color: "error",
      value: "提交失败",
    });
  }

  fileGroups.value = [];
  loading.value = false;
  emit("afterPost");
}

async function postImg2Bed(bed: Bed, file: File): Promise<PostMeme> {
  const res = await bed.postImage(file);
  if (res.err !== 0) {
    throw res.msg;
  }

  let bytes = new Uint8Array(await file.arrayBuffer());
  const hash = aesjs.utils.hex.fromBytes(blake3(bytes));

  const p = {
    url: res.url,
    cover: "",
    format: getFileExtension(res.name).toUpperCase(),
    hash,
    bed_id: res.id,
  } as PostMeme;
  return p;
}

function handleCancel() {
  fileGroups.value = [];
  emit("cancel");
}
</script>

<template>
  <div class="relative flex flex-col gap-4">
    <h3 class="text-lg font-bold">Post New Memes</h3>
    <div class="flex flex-col">
      <!-- drag and drop -->
      <div class="w-auto h-32 rounded-2xl border border-primary p-2">
        <div
          class="hover:bg-base-300 flex flex-col items-center justify-center h-full rounded-2xl cursor-pointer"
          @click="handleClickUpload"
          @drop.prevent="handleOnDrop"
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
</template>
