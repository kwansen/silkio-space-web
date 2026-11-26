<script setup lang="ts">
const docs: [string, string][] = [
  ["产品灵感：一键收藏的想法", "11-25"],
  ["《慢思考》读书笔记", "11-24"],
  ["归档机制设计草案", "11-22"],
  ["周会要点整理", "11-20"],
];
</script>

<template>
  <div class="rounded-xl border border-hairline bg-white shadow-sm">
    <div class="flex items-center gap-2 border-b border-hairline p-4">
      <span class="rounded-lg bg-primary px-3 py-1.5 text-[10px] text-white">创建时间</span>
      <span class="rounded-lg bg-ash px-3 py-1.5 text-[10px] text-pewter">更新时间</span>
      <span class="rounded-lg bg-ash px-3 py-1.5 text-[10px] text-pewter">标题</span>
    </div>
    <div
      v-for="([t, d], j) in docs"
      :key="t"
      class="flex items-center gap-3 px-4 py-3"
      :class="[j === 0 ? 'bg-primary/5' : '', j < docs.length - 1 ? 'border-b border-hairline' : '']"
    >
      <span class="h-2 w-2 rounded-sm bg-fog"></span>
      <span class="truncate text-xs text-carbon">{{ t }}</span>
      <span class="ml-auto shrink-0 text-[10px] text-pewter">{{ d }}</span>
    </div>
  </div>
</template>
