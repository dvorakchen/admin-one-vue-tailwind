<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

const props = defineProps<{
  imgUrls: string[];
  preview?: boolean;
}>();

const showPreview = ref(false);
const previewObj = ref(null as null | HTMLImageElement);

const dialogPreview = useTemplateRef("dialog_preview");

function handleShowPreview(ev: MouseEvent) {
  if (!props.preview) {
    return;
  }
  dialogPreview.value?.showModal();
  showPreview.value = true;
  previewObj.value = ev.currentTarget as HTMLImageElement;
}
</script>

<template>
  <div class="relative">
    <div
      class="avatar-group hover:-space-x-0 min-w-12 min-h-12"
      :class="{ '-space-x-6': !preview }"
    >
      <div class="avatar rounded-xl transition-all" v-for="url in imgUrls">
        <div class="relative w-12">
          <a
            :href="props.preview ? 'javascript:;' : url"
            :target="previewObj ? 'self' : '_blank'"
          >
            <img
              class="cursor-pointer"
              :src="url"
              @pointerover="handleShowPreview"
          /></a>
        </div>
      </div>
    </div>

    <dialog ref="dialog_preview" class="modal">
      <div
        class="fixed z-30 top-0 right-0 max-h-screen overflow-scroll"
        ref="floating_preview"
        v-if="showPreview"
      >
        <div
          class="relative max-w-[80vw] lg:max-w-[50vw] shadow-xl"
          :style="{
            width: `${previewObj?.naturalWidth ?? 0}px`,
          }"
        >
          <img
            class="object-contain rounded-xl"
            :src="previewObj?.src"
            alt="Preview Img"
          />
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button
          @click="
            () => {
              showPreview = false;
            }
          "
        >
          close
        </button>
      </form>
    </dialog>
  </div>
</template>
