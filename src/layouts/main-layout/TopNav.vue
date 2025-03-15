<script setup lang="ts">
import Icon from "@/components/Icon.vue";
import { useLayoutStore } from "@/stores/layout";
import { useAuthStore } from "@/stores/auth";
import {
  mdiLogout,
  mdiFormatListBulletedType,
  mdiChevronDown,
  mdiFaceManProfile,
} from "@mdi/js";
import { useRouter } from "vue-router";

const userStore = useAuthStore();
const layoutStore = useLayoutStore();

const router = useRouter();

function handleAsideMenu() {
  layoutStore.isAsideExpanded = !layoutStore.isAsideExpanded;
}

function handleLogout() {
  router.replace("/login");
}
</script>

<template>
  <nav class="navbar bg-base-100">
    <div class="flex-none lg:hidden">
      <button class="btn btn-square btn-ghost" @click="handleAsideMenu">
        <Icon :d="mdiFormatListBulletedType" />
      </button>
    </div>
    <div class="flex-1"></div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost m-1">
          <span class="w-5">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg"
              alt="profile"
            />
          </span>
          {{ userStore.username }}
          <Icon :d="mdiChevronDown" />
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li>
            <RouterLink to="profile">
              <Icon :d="mdiFaceManProfile" />
              My Profile</RouterLink
            >
          </li>
        </ul>
      </div>
      <button class="btn btn-square btn-ghost" @click="handleLogout">
        <Icon :d="mdiLogout" />
      </button>
    </div>
  </nav>
</template>
