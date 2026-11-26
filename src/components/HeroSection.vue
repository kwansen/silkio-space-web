<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  primary?: string;
  secondary?: string;
}

const props = withDefaults(defineProps<Props>(), {
  primary: "立即体验",
  secondary: "查看功能",
});
</script>

<template>
  <section class="w-full bg-canvas pt-28 pb-16 md:pt-36 md:pb-24">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mx-auto max-w-3xl text-center">
        <h1
          class="mt-3 font-display text-[32px] font-semibold leading-tight text-carbon md:text-[48px]"
        >
          {{ props.title }}
        </h1>
        <p
          v-if="props.subtitle"
          class="mx-auto mt-4 max-w-xl text-base text-pewter md:text-lg"
        >
          {{ props.subtitle }}
        </p>
        <div
          class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#"
            class="tds-transition flex h-11 w-48 items-center justify-center gap-2 rounded-btn bg-primary text-sm font-medium text-white hover:bg-[#3457b1]"
          >
            <slot name="primary">{{ props.primary }}</slot>
          </a>
          <a
            href="#features"
            class="tds-transition flex h-11 w-40 items-center justify-center rounded-btn border border-hairline bg-white text-sm font-medium text-carbon hover:border-graphite"
          >
            {{ props.secondary }}
          </a>
        </div>
      </div>

      <div class="relative mx-auto mt-14 max-w-5xl rounded-2xl overflow-hidden">
        <img
          src="/images/hero/app-overview.png"
          alt="思刻空间产品界面总览"
          class="w-full bg-canvas"
          fetchpriority="high"
        />
      </div>
    </div>
  </section>
</template>
