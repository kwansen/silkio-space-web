<script setup lang="ts">
// 官网演示版：富文本 / 思维导图 / 流程图三合一循环演示。
// 与其它 demo 同风格：白卡片 + 紫色点缀，三个场景轮流播放，
// 场景内元素逐个浮现；底部 Tab 跟随当前场景高亮；
// 偏好减弱动效时静态展示思维导图场景。
import { onMounted, ref, type Component } from "vue";
import DocIcon from "../../icons/Doc.vue";
import MindmapIcon from "../../icons/Mindmap.vue";
import FlowchartIcon from "../../icons/Flowchart.vue";
import { useDemoScale } from "../../composables/useDemoScale";

const rootEl = ref<HTMLElement | null>(null);
const demoScale = useDemoScale(rootEl);

// 场景轮播：0 富文本 → 1 思维导图 → 2 流程图
const phase = ref(0);
// 各场景内的步骤（元素逐个浮现的进度）
const editorStep = ref(0);
const mindStep = ref(0);
const flowStep = ref(0);

const STEP = 450; // 场景内每个元素的浮现间隔
const INTRO = 400; // 切入场景后的准备时长
const SETTLE = 1400; // 场景播完后的停留时长
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TabItem {
  icon: Component;
  text: string;
}

const tabs: TabItem[] = [
  { icon: DocIcon, text: "富文本" },
  { icon: MindmapIcon, text: "思维导图" },
  { icon: FlowchartIcon, text: "流程图" },
];

// 元素浮现的通用过渡样式
const reveal = (step: number, target: number) =>
  step >= target
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-1.5";

onMounted(async () => {
  // 无障碍：偏好减弱动效时，静态展示思维导图场景全部内容
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    phase.value = 1;
    mindStep.value = 4;
    return;
  }
  for (;;) {
    // 1. 富文本：标题 → 正文逐段浮现
    phase.value = 0;
    editorStep.value = 0;
    await sleep(INTRO);
    for (let i = 1; i <= 4; i++) {
      editorStep.value = i;
      await sleep(STEP);
    }
    await sleep(SETTLE);
    // 2. 思维导图：中心节点 → 三条分支逐个生长
    phase.value = 1;
    mindStep.value = 0;
    await sleep(INTRO);
    for (let i = 1; i <= 4; i++) {
      mindStep.value = i;
      await sleep(STEP);
    }
    await sleep(SETTLE);
    // 3. 流程图：节点与连线逐段绘制
    phase.value = 2;
    flowStep.value = 0;
    await sleep(INTRO);
    for (let i = 1; i <= 4; i++) {
      flowStep.value = i;
      await sleep(STEP);
    }
    await sleep(SETTLE);
  }
});
</script>

<template>
  <div
    ref="rootEl"
    class="demo-stage grid place-items-center rounded-card bg-linear-to-br from-ash via-canvas to-ash select-none"
    :style="{ '--demo-scale': demoScale }"
  >
    <!-- 统一槽位：800×464 画板（zoom 缩放单元），卡片 720×384 填满内容区，四周各 40 内边距 -->
    <div class="demo-slot relative w-200 h-116 p-10">
      <div
        class="w-full h-full overflow-hidden rounded-2xl bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)]"
      >
        <!-- 场景区：固定 320px 高，避免切换时布局跳动 -->
        <div class="relative h-80">
          <!-- 场景 1：富文本 — 占位条逐段浮现，带输入光标 -->
          <div v-if="phase === 0" class="absolute inset-0 p-8">
            <div class="flex items-center gap-2">
              <!-- 标题占位条（深色） -->
              <div
                class="h-4 w-44 rounded-full bg-carbon/80 transition-all duration-300"
                :class="reveal(editorStep, 1)"
              />
              <!-- 输入光标：跟随最新浮现的内容 -->
              <span
                v-if="editorStep < 4"
                class="w-1 h-5 bg-purple-500 animate-pulse"
              />
            </div>
            <div class="mt-6 space-y-4">
              <div
                class="h-3 rounded-full bg-ash transition-all duration-300"
                :class="[reveal(editorStep, 2), 'w-full']"
              />
              <div
                class="h-3 rounded-full bg-ash transition-all duration-300"
                :class="[reveal(editorStep, 3), 'w-11/12']"
              />
              <div
                class="h-3 rounded-full bg-purple-100 transition-all duration-300"
                :class="[reveal(editorStep, 4), 'w-2/3']"
              />
            </div>
          </div>

          <!-- 场景 2：思维导图 — 中心节点 → 分支沿贝塞尔曲线生长 -->
          <div v-if="phase === 1" class="absolute inset-0 grid place-items-center">
            <svg viewBox="0 0 280 140" class="h-64 mx-auto">
              <!-- 分支（连线 + 节点同步浮现）：cy 为节点中心 -->
              <g
                v-for="(cy, i) in [24, 70, 116]"
                :key="cy"
                class="transition-all duration-300"
                :style="{
                  opacity: mindStep >= i + 2 ? 1 : 0,
                  transform: mindStep >= i + 2 ? 'translateY(0)' : 'translateY(4px)',
                }"
              >
                <path
                  :d="`M 112 70 C 140 70, 148 ${cy}, 172 ${cy}`"
                  fill="none"
                  stroke="#d4d7de"
                  stroke-width="1.5"
                />
                <rect
                  x="172"
                  :y="cy - 12"
                  width="56"
                  height="24"
                  rx="12"
                  class="fill-neutral-50 stroke-neutral-200"
                  stroke-width="1"
                />
              </g>
              <!-- 中心节点：紫色主节点，最先浮现 -->
              <g
                class="transition-all duration-300"
                :style="{
                  opacity: mindStep >= 1 ? 1 : 0,
                  transform: mindStep >= 1 ? 'translateY(0)' : 'translateY(4px)',
                }"
              >
                <rect x="40" y="56" width="72" height="28" rx="14" fill="#8b5cf6" />
              </g>
            </svg>
          </div>

          <!-- 场景 3：流程图 — 节点与箭头逐段绘制，末节点紫色收尾 -->
          <div v-if="phase === 2" class="absolute inset-0 grid place-items-center">
            <svg viewBox="0 0 280 140" class="h-64 mx-auto">
              <g
                v-for="(node, i) in [16, 84, 152, 220]"
                :key="node"
                class="transition-all duration-300"
                :style="{
                  opacity: flowStep >= i + 1 ? 1 : 0,
                  transform: flowStep >= i + 1 ? 'translateY(0)' : 'translateY(4px)',
                }"
              >
                <rect
                  :x="node"
                  y="58"
                  width="44"
                  height="24"
                  rx="8"
                  :fill="i === 3 ? '#8b5cf6' : '#f5f6f8'"
                  :stroke="i === 3 ? 'none' : '#e2e4ea'"
                  stroke-width="1"
                />
                <!-- 节点间箭头：与下一节点同步浮现 -->
                <g
                  v-if="i < 3"
                  class="transition-opacity duration-300"
                  :style="{ opacity: flowStep >= i + 2 ? 1 : 0 }"
                >
                  <line
                    :x1="node + 46"
                    y1="70"
                    :x2="node + 64"
                    y2="70"
                    stroke="#d4d7de"
                    stroke-width="1.5"
                  />
                  <path
                    :d="`M ${node + 61} 67 L ${node + 66} 70 L ${node + 61} 73`"
                    fill="none"
                    stroke="#d4d7de"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- 底部 Tab 栏：跟随当前场景高亮 -->
        <div class="h-16 border-t border-hairline flex items-center gap-2 px-6">
          <div
            v-for="(tab, index) in tabs"
            :key="tab.text"
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
            :class="phase === index ? 'bg-purple-50 text-purple-700' : 'text-neutral-400'"
          >
            <component :is="tab.icon" class="size-5" />
            {{ tab.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
