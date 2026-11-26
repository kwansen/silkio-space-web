<script setup lang="ts">
// TODO: 替换为实际的仓库地址
const githubUrl = "https://github.com/silkiospace/silkiospace";

const groups = [
  {
    title: "产品",
    links: [
      { label: "其他产品", href: "/products/" },
      { label: "博客", href: "/blog/" },
    ],
  },
  {
    title: "支持",
    links: [
      { label: "联系我们", href: "/contact/" },
      { label: "友情链接", href: "/links/" },
    ],
  },
  {
    title: "开源",
    links: [
      { label: "GitHub", href: githubUrl },
      { label: "捐赠", href: "#" },
    ],
  },
  {
    title: "法律",
    links: [
      { label: "法律条款", href: "/terms/" },
      { label: "隐私政策", href: "/privacy/" },
    ],
  },
];
</script>

<template>
  <footer class="bg-ash px-6 py-12">
    <div class="mx-auto max-w-345.75">
      <p class="text-xs text-pewter">
        思刻空间 —— 思之所至，刻之即成。快速创建、快速检索，让心流不断线。
      </p>
      <div class="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
        <div v-for="g in groups" :key="g.title">
          <h3 class="text-sm font-medium text-carbon">{{ g.title }}</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="l in g.links" :key="l.label">
              <a :href="l.href" class="text-sm font-normal text-pewter hover:underline">{{ l.label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <p class="mt-10 text-xs text-fog">© 2026 Silkio Space. All rights reserved.</p>
    </div>
  </footer>
</template>
