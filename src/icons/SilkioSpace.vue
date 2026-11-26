<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
  >
    <path
      d="M21 0 L3 0 C1.343 0 0 1.343 0 3 L0 21 C0 22.657 1.343 24 3 24 L21 24 C22.657 24 24 22.657 24 21 L24 3 C24 1.343 22.657 0 21 0 Z"
      :fill="bg"
    />
    <path
      d="M4 9.969 L8 3.041 L16 3.041 L20 9.969 L16 16.897 L12.5 22.959 L12.5 11.906 C13.363 11.684 14 10.901 14 9.969 C14 8.865 13.105 7.97 12.002 7.969 L12 7.969 L11.998 7.969 C10.895 7.97 10 8.865 10 9.969 C10 10.901 10.637 11.684 11.5 11.906 L11.5 22.959 L8 16.897 Z"
      :fill="text"
    />
  </svg>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    bg?: string;
    text?: string;
  }>(),
  {
    bg: "#ffffff", // 默认白色背景
    text: "#000000", // 默认黑色文字
  },
);
</script>
