<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { DefaultCategory, FileItem, type FileGroup } from "./models";
import CategoryList from "../CategoryList.vue";
import Icon from "../Icon.vue";
import { mdiClose } from "@mdi/js";

const emit = defineEmits<{
  (e: "change", fileGroups: FileGroup[]): void;
}>();

const props = defineProps<{
  fileGroups: FileGroup[];
}>();

type DraggingFile = {
  groupId: number;
  fileId: number;
  file: File;
  objectUrl: string | null;
};

const previewUrl = ref("");
const dialogPreview = useTemplateRef("dialog_post_preview");
const draggingFile = ref(null as DraggingFile | null);

function handleDragStart(ev: DragEvent) {
  const ele = ev.target as HTMLImageElement;
  ele.style.cursor = "grabbing";
  const groupId = +ele.dataset.groupId!;
  const fileId = +ele.dataset.fileId!;
  const group = props.fileGroups.find((t) => t.id === groupId);
  if (group === undefined) {
    return;
  }

  const file = group.files.find((t) => t.id === fileId);
  if (file === undefined) {
    return;
  }

  draggingFile.value = {
    groupId,
    fileId,
    file: file.file,
    objectUrl: file.objectUrl,
  };
}

function handleDragEnd(ev: DragEvent) {
  const ele = ev.target as HTMLImageElement;
  ele.style.cursor = "grab";
  draggingFile.value = null;
}

function handleDrop(ev: DragEvent) {
  const ele = ev.currentTarget as HTMLDivElement;

  if (draggingFile.value === null) {
    return;
  }
  if (ele.dataset.groupId === undefined) {
    return;
  }
  const toGroupId = +ele.dataset.groupId;

  const fromGroupId = draggingFile.value.groupId;
  if (fromGroupId === toGroupId) {
    return;
  }

  let toGroup = props.fileGroups.find((t) => t.id === toGroupId);
  const fromGroup = props.fileGroups.find((t) => t.id === fromGroupId);
  if (fromGroup === undefined) {
    return;
  }

  if (toGroup === undefined) {
    toGroup = {
      id: toGroupId,
      categories: DefaultCategory.value,
      files: [],
    } as FileGroup;
    props.fileGroups.push(toGroup);
  }

  toGroup.files.push(
    new FileItem(
      draggingFile.value.fileId,
      draggingFile.value.file,
      draggingFile.value.objectUrl
    )
  );

  fromGroup.files = fromGroup.files.filter(
    (t) => t.id !== draggingFile.value?.fileId
  );

  emit("change", props.fileGroups);
}

function handlePreview(url: string) {
  previewUrl.value = url;
  dialogPreview.value?.showModal();
}

function handleMouseDown(ev: MouseEvent) {
  (ev.target as HTMLImageElement).style.cursor = "grabbing";
}

function handleMouseUp(ev: MouseEvent) {
  (ev.target as HTMLImageElement).style.cursor = "grab";
}

function handleRemoveFile(groupId: number, fileId: number) {
  const group = props.fileGroups.find((t) => t.id === groupId);
  if (group === undefined) {
    return;
  }
  group.files = group.files.filter((t) => t.id !== fileId);

  emit("change", props.fileGroups);
}

function handleCategoryChange(groupId: number, list: string[]) {
  const group = props.fileGroups.find((t) => t.id === groupId);
  if (group === undefined) {
    return;
  }

  group.categories = list;
  emit("change", props.fileGroups);
}
</script>

<template>
  <div class="flex flex-wrap gap-4 py-4">
    <div
      class="flex flex-col gap-2 rounded-xl border border-primary p-1"
      v-for="group in fileGroups"
      :key="group.id"
    >
      <div @drop="handleDrop" @dragover.prevent="" :data-group-id="group.id">
        <div class="avatar-group -space-x-6 hover:-space-x-0 min-w-12 min-h-12">
          <div
            class="avatar rounded-xl transition-all"
            v-for="file in group.files"
          >
            <div class="relative w-12" @click="handlePreview(file.objectUrl)">
              <img
                class="cursor-grab"
                :src="file.objectUrl"
                :data-file-id="file.id"
                :data-group-id="group.id"
                draggable="true"
                @dragstart="handleDragStart"
                @dragend="handleDragEnd"
                @dragover.prevent=""
                @mousedown="handleMouseDown"
                @mouseup="handleMouseUp"
              />
              <button
                class="btn btn-xs btn-circle absolute right-0 top-0 w-4 h-4"
                @click="handleRemoveFile(group.id, file.id)"
              >
                <Icon :d="mdiClose" :size="15" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <CategoryList
          :groupId="group.id"
          :list="group.categories"
          :allowAction="true"
          @change="handleCategoryChange"
        />
      </div>
    </div>
  </div>

  <dialog ref="dialog_post_preview" class="modal">
    <div class="modal-box relative max-w-full lg:max-w-8/12">
      <img class="object-contain" :src="previewUrl" alt="preview" />
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
