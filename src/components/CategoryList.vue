<script setup lang="ts">
import { mdiClose, mdiCloseCircle, mdiPlus } from "@mdi/js";
import Icon from "./Icon.vue";
import { nextTick, onMounted, ref, useTemplateRef } from "vue";
import { getAllCategories } from "@/net/category";
import type { CategoryItem } from "@/net/models";

const props = defineProps<{
  groupId?: number;
  list: string[];
  allowAction?: boolean;
}>();

const emit = defineEmits<{
  (e: "change", groupId: number, list: string[]): void;
}>();

const newCateInputRef = useTemplateRef("new-category-input");
const categoryDataset = ref([] as CategoryItem[]);
const readyTypeNewCategory = ref(false);
const newCategory = ref("");

onMounted(async () => {
  categoryDataset.value = await getAllCategories();
});

function handleRemoveCategory(value: string) {
  const list = props.list.filter((t) => t !== value);
  emit("change", props.groupId ?? 0, list);
}

function handleAddNewCategory() {
  readyTypeNewCategory.value = true;
  nextTick(() => {
    newCateInputRef.value?.focus();
  });
}

function handleNewCategoryKeyEnter() {
  const text = newCategory.value.trim();
  if (text === "") {
    return;
  }

  if (props.list.some((t) => t === text)) {
    return;
  }

  props.list.push(text);
  newCategory.value = "";
  readyTypeNewCategory.value = false;
  emit("change", props.groupId ?? 0, props.list);
}
</script>

<template>
  <div class="flex gap-2">
    <span class="" v-for="item in list">
      <span
        class="relative badge badge-info text-nowrap"
        :class="{ 'pr-6': allowAction }"
        >{{ item }}
        <button
          class="absolute right-0 btn btn-xs btn-circle btn-ghost"
          v-if="allowAction"
          @click="handleRemoveCategory(item)"
        >
          <Icon :d="mdiCloseCircle" :size="20" />
        </button>
      </span>
    </span>
    <label class="input input-xs" v-show="readyTypeNewCategory">
      <input
        ref="new-category-input"
        v-model="newCategory"
        type="text"
        class="grow"
        @keyup.enter="handleNewCategoryKeyEnter"
        list="existed-categories"
      />
      <datalist id="existed-categories">
        <option v-for="item in categoryDataset" :value="item.name"></option>
      </datalist>

      <kbd class="kbd kbd-sm cursor-pointer" @click="handleNewCategoryKeyEnter"
        >Enter</kbd
      >
      <button
        class="btn btn-xs btn-circle w-4 h-4"
        @click="
          () => {
            readyTypeNewCategory = false;
          }
        "
      >
        <Icon :d="mdiClose" :size="15" />
      </button>
    </label>
    <button
      class="btn btn-xs btn-circle"
      v-if="allowAction"
      @click="handleAddNewCategory"
    >
      <Icon :d="mdiPlus" :size="20" />
    </button>
  </div>
</template>
