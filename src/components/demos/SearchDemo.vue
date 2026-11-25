<script setup lang="ts">
// 官网演示版：改编自应用内 SearchView.vue，
// 保留相同的搜索框/结果列表模板结构，去掉 Tauri/打开文档逻辑，
// 用响应式状态循环演示：键入关键词 → 结果浮现 → ↑↓ 切换激活 → 清空重来。
import { onMounted, ref, type Component } from "vue";
import DocIcon from "../../icons/Doc.vue";
import FlowchartIcon from "../../icons/Flowchart.vue";
import MindmapIcon from "../../icons/Mindmap.vue";

const query = ref("");
const activeIndex = ref(0);

interface ResultItem {
  icon: Component;
  title: string;
  desc: string;
}

// 演示结果：与真实组件一致，图标随文档类型变化
const results: ResultItem[] = [
  {
    icon: DocIcon,
    title: "保持心流的三种方法",
    desc: "减少打断、批量处理、固定时段深度工作……",
  },
  {
    icon: MindmapIcon,
    title: "心流：概念脑图",
    desc: "从心理学概念到日常实践的完整脉络",
  },
  {
    icon: FlowchartIcon,
    title: "晨间工作流",
    desc: "起床 → 快速回顾 → 进入深度专注",
  },
  {
    icon: DocIcon,
    title: "《心流：最优体验心理学》",
    desc: "从心理学概念到日常实践的完整脉络",
  },
];

const TYPE_INTERVAL = 400; // 每个字符键入间隔
const HOLD = 600; // 每项停留时长
const SETTLE = 1500; // 激活最后一项后的额外停留
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const keyword = "心流";

// v-if + Transition：隐藏时完全卸载 DOM，不留状态残留；
// 卸载后重建，激活态天然回到默认值
const show = ref(false);
// 结果列表的显隐：等关键词全部键入完成后再浮现，
// 避免键入过程中（每个字符都会触发）结果提前出现
const resultsVisible = ref(false);
// Alt+S 快捷键演示：先按键，再浮现搜索框
const keysVisible = ref(false);
const altDown = ref(false);
const sDown = ref(false);

onMounted(async () => {
  // 无障碍：偏好减弱动效时，静态展示完整结果 + 首项激活
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    query.value = keyword;
    show.value = true;
    return;
  }
  for (;;) {
    // 1. 卡片卸载后立即显示快捷键，停 1000ms
    altDown.value = false;
    sDown.value = false;
    keysVisible.value = true;
    await sleep(1000);
    // 2. 依次按下 Alt、S
    altDown.value = true;
    await sleep(250);
    sDown.value = true;
    await sleep(250);
    // 3. 快捷键淡出，搜索框浮现
    keysVisible.value = false;
    show.value = true;
    query.value = "";
    resultsVisible.value = false;
    activeIndex.value = 0;
    await sleep(HOLD);
    // 4. 逐字键入关键词：每字后等待，最后一个字落定即出结果，不额外等待
    for (let i = 0; i < keyword.length; i++) {
      query.value += keyword[i];
      if (i < keyword.length - 1) await sleep(TYPE_INTERVAL);
    }
    resultsVisible.value = true;
    await sleep(HOLD);
    // 3. ↑↓ 依次切换第二、三、四项
    activeIndex.value = 1;
    await sleep(HOLD);
    activeIndex.value = 2;
    await sleep(HOLD);
    activeIndex.value = 3;
    await sleep(HOLD + SETTLE); // 激活最后一项后多停留一秒半
    show.value = false; // 直接卸载：v-if 完全卸载，query 一并重置
    query.value = "";
    activeIndex.value = 0;
    // 卸载后直接回到第 1 步，无间歇
  }
});
</script>

<template>
  <div
    class="grid min-h-120 place-items-center rounded-card bg-linear-to-br from-ash via-canvas to-ash py-10 select-none"
  >
    <!-- 统一槽位 w-180 h-96：卡片顶部对齐（与真实搜索窗一致，搜索框靠顶） -->
    <div class="relative w-180 h-96 flex items-start">
      <!-- Alt+S 快捷键演示：大键帽，垂直水平居中，先按键再浮现搜索框 -->
      <Transition
        enter-active-class="transition-[opacity,transform] duration-250 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-opacity duration-250 ease-out"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="keysVisible"
          class="absolute inset-0 grid place-items-center"
        >
          <div class="flex items-center gap-3 text-lg text-carbon">
            <kbd
              class="min-w-14 rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-center text-base font-medium shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-all duration-100"
              :class="
                altDown
                  ? 'translate-y-0.5 bg-ash text-purple-700 border-purple-300 shadow-[inset_0_2px_3px_rgba(0,0,0,0.15)]'
                  : ''
              "
            >
              Alt
            </kbd>
            <span class="text-xl font-light text-fog">+</span>
            <kbd
              class="min-w-14 rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-center text-base font-medium shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-all duration-100"
              :class="
                sDown
                  ? 'translate-y-0.5 bg-ash text-purple-700 border-purple-300 shadow-[inset_0_2px_3px_rgba(0,0,0,0.15)]'
                  : ''
              "
            >
              K
            </kbd>
          </div>
        </div>
      </Transition>
      <Transition
        enter-active-class="transition-[opacity,transform] duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-2.5 scale-[0.95]"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-opacity duration-200 ease-out"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="show"
          class="w-full overflow-hidden rounded-2xl bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)]"
        >
          <!-- 搜索框：完全参照 SearchView.vue 头部，仅有搜索词时显示分隔线 -->
          <div
            class="flex h-16"
            :class="resultsVisible ? 'border-b border-purple-200' : ''"
          >
            <div class="size-16 grid place-items-center">
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </div>
            <input
              type="text"
              readonly
              :value="query"
              class="flex-1 pr-4 outline-none"
            />
          </div>

          <!-- 结果列表：完全参照 SearchView.vue，h-16 行、border-t、激活 bg-primary-50 -->
          <Transition
            enter-active-class="transition-opacity duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <div v-if="resultsVisible">
              <div
                v-for="(item, index) in results"
                :key="item.title"
                class="h-16 flex items-center px-4 border-b border-neutral-100"
                :class="index === activeIndex ? 'bg-purple-50' : ''"
              >
                <div
                  class="size-8 bg-neutral-50 grid place-items-center rounded-md text-neutral-400"
                >
                  <component :is="item.icon" class="size-5" />
                </div>
                <div class="flex-1 px-4 min-w-0">
                  <div class="truncate">
                    {{ item.title }}
                  </div>
                  <div class="truncate text-xs text-neutral-400 mt-0.5">
                    {{ item.desc }}
                  </div>
                </div>
                <div class="text-neutral-400 text-xs">
                  Ctrl + {{ index + 1 }}
                </div>
              </div>
            </div>
          </Transition>

          <!-- 底部快捷键提示栏：完全参照 SearchView.vue -->
          <div
            v-if="resultsVisible"
            class="h-16 flex items-center gap-4 px-4 text-xs text-neutral-400"
          >
            <span>↑↓ 选择</span>
            <span>↵ 打开</span>
            <span>Esc 关闭</span>
            <span>Ctrl+1~7 快速打开</span>
            <div class="flex-1"></div>
            <span>1/4</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
