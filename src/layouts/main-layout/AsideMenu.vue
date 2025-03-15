<script setup lang="ts">
import { mdiLogout, mdiClose } from "@mdi/js";
import Icon from "@/components/Icon.vue";
import AsideLink from "./AsideLink.vue";
import { useLayoutStore } from "@/stores/layout";
import { menuList } from "@/data/menu";
import { useRouter } from "vue-router";

const menu = menuList;

const layoutStore = useLayoutStore();

const router = useRouter();

function handleCloseMenu() {
  layoutStore.isAsideExpanded = false;
}

function handleLogout() {
  router.replace("/login");
}
</script>

<template>
  <div
    class="flex flex-col bg-neutral text-neutral-content h-full w-auto rounded-2xl overflow-clip"
  >
    <h1 class="flex bg-primary text-center font-bold text-xl p-4">
      <span class="flex-grow justify-start lg:justify-center flex items-center"
        >Menu</span
      >
      <button
        class="btn btn-square btn-ghost lg:hidden"
        @click="handleCloseMenu"
      >
        <Icon :d="mdiClose" />
      </button>
    </h1>
    <ul class="flex-grow">
      <li class="px-4 py-3 font-bold" v-for="item in menu" :key="item.label">
        <AsideLink :label="item.label" :to="item.route" :icon="item.icon" />
      </li>
    </ul>
    <div>
      <button class="btn btn-accent btn-block" @click="handleLogout">
        <Icon :d="mdiLogout" />
        Log Out
      </button>
    </div>
  </div>
</template>
