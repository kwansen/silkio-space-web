<script setup lang="ts">
const results: [string, string][] = [
  ["保持心流的三种方法", "笔记"],
  ["心流：概念脑图", "思维导图"],
  ["周会要点整理", "文档"],
];
</script>

<template>
  <div class="rounded-xl border border-hairline bg-white shadow-sm">
    <div class="flex items-center gap-3 border-b border-hairline p-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0ab" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <span class="text-xs text-carbon">心流</span>
      <span class="ml-auto rounded bg-ash px-2 py-1 text-[10px] text-pewter">全局检索</span>
    </div>
    <div
      v-for="([t, tag], j) in results"
      :key="t"
      class="flex items-center gap-3 px-4 py-3"
      :class="[j === 0 ? 'bg-primary/5' : '', j < results.length - 1 ? 'border-b border-hairline' : '']"
    >
      <span class="text-xs text-carbon">
        <span class="rounded bg-primary/15 px-0.5 text-primary">{{ t.slice(0, 2) }}</span>{{ t.slice(2) }}
      </span>
      <span class="ml-auto rounded bg-ash px-2 py-0.5 text-[10px] text-pewter">{{ tag }}</span>
    </div>
  </div>
</template>
