<script setup lang="ts">
import { RouterView } from "vue-router";
import { useMsgStore } from "./stores/msg";

const msgStore = useMsgStore();
</script>

<template>
  <div class="toast toast-top toast-end z-50">
    <div
      class="alert"
      :class="{
        'alert-success': msg.color === 'success',
        'alert-info': msg.color === 'info',
        'alert-warning': msg.color === 'warning',
        'alert-error': msg.color === 'info',
      }"
      v-for="msg in msgStore.messages.values()"
    >
      <span class="font-bold">{{ msg.value }}</span>
    </div>
  </div>
  <RouterView />
</template>
