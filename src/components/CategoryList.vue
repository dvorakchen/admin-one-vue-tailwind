<script setup lang="ts">
import { mdiClose, mdiCloseCircle, mdiPlus } from "@mdi/js";
import Icon from "./Icon.vue";
import { onMounted, ref } from "vue";
import { getAllCategories } from "@/net/category";
import type { CategoryItem } from "@/net/models";

const props = defineProps<{
  groupId: number;
  list: string[];
}>();

const emit = defineEmits<{
  (e: "change", groupId: number, list: string[]): void;
}>();

const categoryDataset = ref([] as CategoryItem[]);
const readyTypeNewCategory = ref(false);
const newCategory = ref("");

onMounted(async () => {
  categoryDataset.value = await getAllCategories();
});

function handleRemoveCategory(value: string) {
  const list = props.list.filter((t) => t !== value);
  emit("change", props.groupId, list);
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
  emit("change", props.groupId, props.list);
}
</script>

<template>
  <div class="flex gap-2">
    <span class="" v-for="item in list">
      <span class="relative badge badge-info pr-6 text-nowrap"
        >{{ item }}
        <button
          class="absolute right-0 btn btn-xs btn-circle btn-ghost"
          @click="handleRemoveCategory(item)"
        >
          <Icon :d="mdiCloseCircle" :size="20" />
        </button>
      </span>
    </span>
    <label class="input input-xs" v-show="readyTypeNewCategory">
      <input
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
      @click="
        () => {
          readyTypeNewCategory = true;
        }
      "
    >
      <Icon :d="mdiPlus" :size="20" />
    </button>
  </div>
</template>
