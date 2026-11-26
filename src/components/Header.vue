<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const links = ["产品", "解决方案", "技术", "关于我们"];
const solid = ref(false);
const drawerOpen = ref(false);

const onScroll = () => {
  solid.value = window.scrollY > 24;
};

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300"
    :class="{ 'bg-white/85 backdrop-blur-md border-b border-hairline': solid }"
  >
    <nav class="mx-auto flex h-14 max-w-345.75 items-center justify-between px-6">
      <a
        href="/"
        class="text-[17px] font-medium tracking-[0.35em] text-carbon uppercase"
      >
        Silkio Space
      </a>
      <ul class="hidden items-center gap-2 md:flex">
        <li v-for="label in links" :key="label">
          <a
            href="#"
            class="nav-item rounded-btn px-4 py-1 text-sm font-medium text-graphite hover:bg-ash"
          >
            {{ label }}
          </a>
        </li>
      </ul>
      <div class="hidden items-center gap-2 md:flex">
        <a
          href="#"
          class="tds-transition flex h-9 w-28 items-center justify-center rounded-btn bg-primary text-sm font-medium text-white hover:bg-[#3457b1]"
        >
          联系我们
        </a>
      </div>
      <button class="p-2 text-carbon md:hidden" aria-label="菜单" @click="drawerOpen = !drawerOpen">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M0 1h20M0 7h20M0 13h20" />
        </svg>
      </button>
    </nav>
    <div v-show="drawerOpen" class="bg-white px-6 py-4 md:hidden">
      <a v-for="label in links" :key="label" href="#" class="block py-2 text-sm font-medium text-carbon">
        {{ label }}
      </a>
      <a href="#" class="block py-2 text-sm font-medium text-carbon">下载</a>
    </div>
  </header>
</template>
