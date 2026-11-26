<script setup lang="ts">
import FastCreateDemo from "./demos/FastCreateDemo.vue";
import DocTypeDemo from "./demos/DocTypeDemo.vue";
import SearchDemo from "./demos/SearchDemo.vue";
import SortDemo from "./demos/SortDemo.vue";
import ArchiveDemo from "./demos/ArchiveDemo.vue";
import EditorStaticMockup from "./demos/EditorStaticMockup.vue";
import SearchStaticMockup from "./demos/SearchStaticMockup.vue";
import SortStaticMockup from "./demos/SortStaticMockup.vue";
import ArchiveStaticMockup from "./demos/ArchiveStaticMockup.vue";

interface Feature {
  title: string;
  desc: string;
  link: string;
  visual:
    | "capture"
    | "editor"
    | "editorStatic"
    | "search"
    | "searchStatic"
    | "sort"
    | "sortStatic"
    | "archive"
    | "archiveStatic";
}

defineProps<{ features: Feature[] }>();
</script>

<template>
  <section
    v-for="(f, i) in features"
    :key="f.title"
    class="w-full py-16 md:py-24"
    :class="i % 2 === 1 ? 'bg-canvas' : 'bg-white'"
  >
    <div class="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-3 md:gap-14">
      <div :class="i % 2 === 1 ? 'md:order-2' : ''">
        <h2 class="font-display text-[26px] font-semibold text-carbon md:text-[34px]">
          {{ f.title }}
        </h2>
        <p class="mt-4 max-w-md text-base leading-relaxed text-pewter">
          {{ f.desc }}
        </p>
        <a
          href="#"
          class="tds-transition mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {{ f.link }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      </div>
      <div :class="[i % 2 === 1 ? 'md:order-1' : '', 'md:col-span-2']">
        <FastCreateDemo v-if="f.visual === 'capture'" />
        <DocTypeDemo v-else-if="f.visual === 'editor'" />
        <EditorStaticMockup v-else-if="f.visual === 'editorStatic'" />
        <SearchDemo v-else-if="f.visual === 'search'" />
        <SearchStaticMockup v-else-if="f.visual === 'searchStatic'" />
        <SortDemo v-else-if="f.visual === 'sort'" />
        <SortStaticMockup v-else-if="f.visual === 'sortStatic'" />
        <ArchiveDemo v-else-if="f.visual === 'archive'" />
        <ArchiveStaticMockup v-else-if="f.visual === 'archiveStatic'" />
      </div>
    </div>
  </section>
</template>
