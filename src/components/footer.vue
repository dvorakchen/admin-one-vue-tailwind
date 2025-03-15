<script setup lang="ts">
import { mdiFootPrint, mdiGithub } from "@mdi/js";
import Icon from "./Icon.vue";
</script>

<template>
  <footer class="footer sm:footer-horizontal items-center p-4 mt-8">
    <aside class="grid-flow-col items-center">
      <Icon :d="mdiFootPrint" />
      <p>Copyright © {{ new Date().getFullYear() }} - All right reserved</p>
    </aside>
    <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      <a
        href="https://github.com/dvorakchen/admin-one-vue-tailwind"
        target="_blank"
      >
        <Icon :d="mdiGithub" />
      </a>
    </nav>
  </footer>
</template>
