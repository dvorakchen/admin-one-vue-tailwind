<script setup lang="ts">
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import Icon from "../Icon.vue";
import Apostrophe from "./Apostrophe.vue";

const props = defineProps<{
  page: number;
  total: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", page: number): void;
}>();

function handleClick(page: number) {
  emit("click", page);
}

function handleBackward() {
  if (props.page <= 1) {
    return;
  }

  handleClick(props.page - 1);
}

function handleForward() {
  if (props.page >= props.total) {
    return;
  }

  handleClick(props.page + 1);
}
</script>

<template>
  <div>
    <div class="join">
      <button
        class="join-item btn btn-secondary"
        @click="handleBackward"
        :disabled="props.page === 1 || loading"
      >
        <Icon :d="mdiChevronLeft" :size="20" />
      </button>
      <template v-if="props.total <= 5">
        <button
          class="join-item btn btn-secondary"
          :class="{
            'btn-active': p === props.page,
          }"
          v-for="p in total"
          @click="handleClick(p)"
          :disabled="loading"
        >
          {{ p }}
        </button>
      </template>

      <template v-else>
        <button
          class="join-item btn btn-secondary"
          :class="{
            'btn-active': props.page === p,
          }"
          v-for="p in 2"
          @click="handleClick(p)"
          :disabled="loading"
        >
          {{ p }}
        </button>
        <Apostrophe v-if="props.page === 1 || props.page === total" />
        <template v-if="props.page === 2">
          <button
            class="join-item btn btn-secondary"
            @click="handleClick(3)"
            :disabled="loading"
          >
            {{ 3 }}
          </button>
          <Apostrophe />
        </template>

        <template v-if="props.page > 2 && props.page < total - 1">
          <Apostrophe v-if="props.page > 4" />
          <button
            class="join-item btn btn-secondary"
            v-if="props.page > 3"
            @click="handleClick(props.page - 1)"
            :disabled="loading"
          >
            {{ props.page - 1 }}
          </button>
          <button
            class="join-item btn btn-secondary btn-active"
            @click="handleClick(props.page)"
            :disabled="loading"
          >
            {{ props.page }}
          </button>
          <button
            class="join-item btn btn-secondary"
            v-if="props.page < total - 2"
            @click="handleClick(props.page + 1)"
            :disabled="loading"
          >
            {{ props.page + 1 }}
          </button>
          <Apostrophe v-if="props.page < total - 3" />
        </template>

        <template v-if="props.page === total - 1">
          <Apostrophe />
          <button
            class="join-item btn btn-secondary"
            @click="handleClick(total - 2)"
            :disabled="loading"
          >
            {{ total - 2 }}
          </button>
          <span>...</span>
        </template>

        <button
          class="join-item btn btn-secondary"
          :class="{
            'btn-active': props.page === total - 2 + p,
          }"
          v-for="p in 2"
          @click="handleClick(total - 2 + p)"
          :disabled="loading"
        >
          {{ total - 2 + p }}
        </button>
      </template>

      <button
        class="join-item btn btn-secondary"
        @click="handleForward"
        :disabled="props.page === total || loading"
      >
        <Icon :d="mdiChevronRight" :size="20" />
      </button>
    </div>
    <span class="loading mx-2" :hidden="!loading"></span>
  </div>
</template>
