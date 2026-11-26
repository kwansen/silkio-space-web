<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Component } from "vue";

interface Feature {
  title: string;
  desc: string;
  link: string;
  /** 动画演示版 */
  component: Component;
  /** 静态模拟图版，未传时始终用 component */
  staticComponent?: Component;
}

defineProps<{ features: readonly Feature[] }>();

const prefersReducedMotion = ref(false);
let mql: MediaQueryList | undefined;
const onChange = (e: MediaQueryListEvent) => {
  prefersReducedMotion.value = e.matches;
};

onMounted(() => {
  mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = mql.matches;
  mql.addEventListener("change", onChange);
});
onBeforeUnmount(() => mql?.removeEventListener("change", onChange));

function resolveVisual(f: Feature): Component {
  return prefersReducedMotion.value && f.staticComponent
    ? f.staticComponent
    : f.component;
}
</script>

<template>
  <section
    v-for="(f, i) in features"
    :key="f.title"
    class="w-full py-16 md:py-24"
    :class="i % 2 === 1 ? 'bg-canvas' : 'bg-white'"
  >
    <div
      class="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-7xl items-center gap-10 px-6 md:grid-cols-3 md:gap-14"
    >
      <div :class="i % 2 === 1 ? 'md:order-2' : ''">
        <h2
          class="font-display text-[26px] font-semibold text-carbon md:text-[34px]"
        >
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      </div>
      <div :class="[i % 2 === 1 ? 'md:order-1' : '', 'md:col-span-2']">
        <component :is="resolveVisual(f)" />
      </div>
    </div>
  </section>
</template>
