<script setup lang="ts">
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
</script>

<template>
  <div>
    <div class="join">
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
    </div>
    <span class="loading mx-2" :hidden="!loading"></span>
  </div>
</template>
