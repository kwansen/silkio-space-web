<script setup lang="ts">
// 官网演示版：改编自应用内 FeatureFastCreate.vue，
// 保留相同模板结构与交互样式，去掉 Tauri/创建逻辑，
// 用响应式状态循环演示：浮现（首项激活）→ ↑↓ 依次切换 → 消失。
import { onMounted, ref, type Component } from "vue";
import DocIcon from "../../icons/Doc.vue";
import FlowchartIcon from "../../icons/Flowchart.vue";
import MindmapIcon from "../../icons/Mindmap.vue";

const activeIndex = ref(0);

interface CreateItem {
  icon: Component;
  text: string;
}

// 与真实组件一致：数字键 1~3 与条目顺序一一对应
const items: CreateItem[] = [
  { icon: DocIcon, text: "富文本" },
  { icon: MindmapIcon, text: "思维导图" },
  { icon: FlowchartIcon, text: "流程图" },
];

const HOLD = 600; // 每项停留时长
const SETTLE = 1500; // 激活第三项后的额外停留
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// v-if + Transition：隐藏时完全卸载 DOM，不留状态残留；
// 卸载后重建，激活态天然回到默认值
const show = ref(false);
// Alt+N 快捷键演示：先按键，再弹窗
const keysVisible = ref(false);
const altDown = ref(false);
const nDown = ref(false);

onMounted(async () => {
  // 无障碍：偏好减弱动效时，静态展示弹窗 + 首项激活
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show.value = true;
    return;
  }
  for (;;) {
    // 1. 弹窗卸载后立即显示快捷键，停 500ms
    altDown.value = false;
    nDown.value = false;
    keysVisible.value = true;
    await sleep(1000);
    // 2. 依次按下 Alt、N
    altDown.value = true;
    await sleep(250);
    nDown.value = true;
    await sleep(250);
    // 3. 快捷键淡出，弹窗浮现（首项激活）
    keysVisible.value = false;
    show.value = true;
    activeIndex.value = 0;
    await sleep(HOLD);
    activeIndex.value = 1; // 切换第二项（模拟 ↑）
    await sleep(HOLD);
    activeIndex.value = 2; // 切换第三项
    await sleep(HOLD + SETTLE); // 多停留一秒再隐藏
    show.value = false; // 消失：v-if 完全卸载
    // 卸载后直接回到第 1 步，无间歇
  }
});
</script>

<template>
  <div
    class="grid min-h-120 place-items-center rounded-card bg-linear-to-br from-ash via-canvas to-ash py-10 select-none"
  >
    <!-- 统一槽位 w-180 h-96：小卡片居中；Alt+N 键帽层绝对定位居中 -->
    <div class="relative w-180 h-96 flex items-center justify-center">
      <!-- Alt+N 快捷键演示：大键帽，垂直水平居中，先按键再弹窗 -->
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
                nDown
                  ? 'translate-y-0.5 bg-ash text-purple-700 border-purple-300 shadow-[inset_0_2px_3px_rgba(0,0,0,0.15)]'
                  : ''
              "
            >
              N
            </kbd>
          </div>
        </div>
      </Transition>
      <Transition
        enter-active-class="transition-[opacity,transform] duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-2.5 scale-[0.92]"
        enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div
          v-if="show"
          class="w-95 overflow-hidden rounded-xl bg-white p-1.5 space-y-0.5 shadow-[0_4px_24px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
        >
          <div
            v-for="(item, index) in items"
            :key="item.text"
            class="relative h-12 flex items-center gap-3 rounded-lg pl-4 pr-3 transition-colors duration-100"
            :class="
              index === activeIndex
                ? 'bg-purple-50 text-purple-700'
                : 'text-carbon'
            "
          >
            <!-- 激活项左侧指示条 -->
            <span
              v-if="index === activeIndex"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-purple-400"
            ></span>
            <!-- 图标（复用应用内真实图标组件） -->
            <component
              :is="item.icon"
              class="size-5 shrink-0 transition-colors duration-100"
              :class="
                index === activeIndex ? 'text-purple-700' : 'text-neutral-500'
              "
            />
            <span class="flex-1 text-sm font-medium">{{ item.text }}</span>
            <span
              class="size-5 grid place-items-center rounded text-[11px] transition-colors duration-100"
              :class="
                index === activeIndex
                  ? 'bg-purple-400 text-white'
                  : 'bg-ash text-pewter'
              "
            >
              {{ index + 1 }}
            </span>
          </div>
          <div
            class="border-t border-hairline h-12 px-3 flex items-center gap-2 text-[11px] text-pewter"
          >
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-px rounded bg-ash text-pewter font-medium"
                >↑↓</kbd
              >
              切换
            </span>
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-px rounded bg-ash text-pewter font-medium"
                >Enter</kbd
              >
              创建
            </span>
            <span class="ml-auto">Esc 关闭</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
