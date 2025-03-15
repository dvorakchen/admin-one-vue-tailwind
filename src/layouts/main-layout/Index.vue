<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";
import AsideMenu from "./AsideMenu.vue";
import TopNav from "./TopNav.vue";
import Footer from "@/components/footer.vue";
import { onMounted, useTemplateRef, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const asideRef = useTemplateRef("aside-menu");
const asideBgRef = useTemplateRef("aside-bg");
const layoutStore = useLayoutStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (!(await authStore.checkLoggedIn())) {
    router.replace("/login");
  }
});

watch(layoutStore, (value) => {
  if (value.isAsideExpanded) {
    asideRef.value?.classList.remove("-translate-x-60");
    asideBgRef.value!.style.display = "block";
  } else {
    asideRef.value?.classList.add("-translate-x-60");
    asideBgRef.value!.style.display = "none";
  }
});

function handleCloseMenu() {
  layoutStore.isAsideExpanded = false;
}
</script>

<template>
  <div class="relative h-screen w-screen lg:w-auto">
    <div
      ref="aside-menu"
      class="fixed z-40 top-0 h-screen w-60 py-2 pl-2 -translate-x-60 lg:translate-x-0 transition-all"
    >
      <AsideMenu />
    </div>
    <div
      class="absolute inset-0 z-10 bg-base-300/70 hidden"
      ref="aside-bg"
      @click="handleCloseMenu"
    ></div>
    <main class="px-8 lg:pl-68 flex flex-col h-full">
      <TopNav />
      <section class="flex-grow">
        <slot />
      </section>
      <Footer />
    </main>
  </div>
</template>
