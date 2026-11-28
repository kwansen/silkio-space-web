<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import SilkioSpaceIcon from "../icons/SilkioSpace.vue";
import GitHubIcon from "../icons/GitHub.vue";
import WindowsIcon from "../icons/Windows.vue";

// TODO: 替换为实际的仓库地址
const githubUrl = "https://github.com/kwansen/silkio-space";

const links = [
  { label: "博客", href: "/blog/" },
  { label: "联系我们", href: "/contact/" },
  { label: "其他产品", href: "/products/" },
  { label: "定价", href: "/pricing/" },
  { label: "购买同步", href: "/purchase/" },
  { label: "注册", href: "/register/" },
];
const solid = ref(false);
const drawerOpen = ref(false);

const getScrollTop = () => {
  // 页面实际滚动发生在 App 根 div（body overflow-y-hidden），window.scrollY 恒为 0
  const scroller = document.querySelector("main")?.parentElement;
  return window.scrollY || scroller?.scrollTop || 0;
};

const onScroll = () => {
  solid.value = getScrollTop() > 24;
};

onMounted(() => {
  onScroll();
  // 捕获阶段监听：内部滚动容器的 scroll 事件不冒泡，但能在 window 捕获到
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
});
onUnmounted(() =>
  window.removeEventListener("scroll", onScroll, { capture: true }),
);
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300"
    :class="{ 'bg-white/85 backdrop-blur-md border-b border-hairline': solid }"
  >
    <nav
      class="mx-auto flex h-14 max-w-345.75 items-center justify-between px-6"
    >
      <a
        href="/"
        class="flex items-center gap-2.5 text-[17px] font-medium tracking-[0.35em] text-carbon uppercase"
      >
        <SilkioSpaceIcon class="text-xl" />
        Silkio Space
      </a>
      <ul class="hidden items-center gap-2 md:flex">
        <li v-for="l in links" :key="l.label">
          <a
            :href="l.href"
            class="nav-item rounded-btn px-4 py-1 text-sm font-medium text-graphite hover:bg-ash"
          >
            {{ l.label }}
          </a>
        </li>
      </ul>
      <div class="hidden items-center gap-2 md:flex">
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
          class="tds-transition flex h-9 w-9 items-center justify-center rounded-btn text-xl text-carbon hover:bg-ash"
        >
          <GitHubIcon />
        </a>
        <a
          href="#"
          class="tds-transition flex h-9 w-28 items-center justify-center gap-2 rounded-btn bg-primary text-sm font-medium text-white hover:bg-[#3457b1]"
        >
          <WindowsIcon class="h-4 w-4" aria-hidden="true" />
          下载
        </a>
      </div>
      <button
        class="p-2 text-carbon md:hidden"
        aria-label="菜单"
        @click="drawerOpen = !drawerOpen"
      >
        <svg
          width="20"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M0 1h20M0 7h20M0 13h20" />
        </svg>
      </button>
    </nav>
    <div v-show="drawerOpen" class="bg-white px-6 py-4 md:hidden">
      <a
        v-for="l in links"
        :key="l.label"
        :href="l.href"
        class="block py-2 text-sm font-medium text-carbon"
      >
        {{ l.label }}
      </a>
      <a href="#" class="block py-2 text-sm font-medium text-carbon">下载</a>
    </div>
  </header>
</template>
