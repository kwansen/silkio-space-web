<script setup lang="ts">
// 官网演示版：改编自应用内 DocSort（DocSortOption / DocItem），
// 保留相同的选项栏与列表行模板结构，去掉 store/打开文档逻辑。
// 循环演示：DocSortOption 依次切换排序方式，列表按所选字段真实排序，
// 右侧关键信息随排序切换。
import { computed, onMounted, ref } from "vue";
import DocIcon from "../../icons/Doc.vue";
import FlowchartIcon from "../../icons/Flowchart.vue";
import MindmapIcon from "../../icons/Mindmap.vue";
import { useDemoScale } from "../../composables/useDemoScale";

const rootEl = ref<HTMLElement | null>(null);
const demoScale = useDemoScale(rootEl);

type SortKey = "viewedAt" | "updatedAt" | "createdAt" | "wordCount";

// 演示用时间戳构造（2026 年，与真实数据同结构：毫秒时间戳）
const ts = (month: number, day: number, hour: number, minute: number) =>
  new Date(2026, month - 1, day, hour, minute).getTime();

interface DemoDoc {
  id: string;
  icon: typeof DocIcon;
  title: string;
  content: string;
  viewedAt: number;
  updatedAt: number;
  createdAt: number;
  wordCount: number;
}

const docs: DemoDoc[] = [
  {
    id: "a",
    icon: DocIcon,
    title: "爬虫性能优化实战",
    content: "并发调度、连接复用与增量抓取的完整方案",
    viewedAt: ts(11, 25, 9, 41),
    updatedAt: ts(11, 25, 8, 30),
    createdAt: ts(11, 2, 10, 0),
    wordCount: 3200,
  },
  {
    id: "b",
    icon: FlowchartIcon,
    title: "婚礼筹备流程",
    content: "定档 → 场地 → 婚庆 → 请柬 → 彩排 → 正席",
    viewedAt: ts(11, 23, 19, 0),
    updatedAt: ts(11, 24, 14, 0),
    createdAt: ts(11, 25, 6, 10),
    wordCount: 900,
  },
  {
    id: "c",
    icon: MindmapIcon,
    title: "心理学常见效应盘点",
    content: "从晕轮效应到心流，一张导图理清经典现象",
    viewedAt: ts(11, 25, 21, 5),
    updatedAt: ts(11, 21, 9, 12),
    createdAt: ts(11, 20, 16, 40),
    wordCount: 1500,
  },
  {
    id: "d",
    icon: DocIcon,
    title: "《慢思考》读书笔记",
    content: "大脑四层结构、中断的代价与深度工作",
    viewedAt: ts(11, 19, 22, 30),
    updatedAt: ts(11, 18, 11, 11),
    createdAt: ts(11, 15, 8, 0),
    wordCount: 2600,
  },
  {
    id: "e",
    icon: FlowchartIcon,
    title: "每周健身计划",
    content: "周一胸背 → 周三下肢 → 周五肩臂 → 周日有氧",
    viewedAt: ts(11, 21, 7, 5),
    updatedAt: ts(11, 22, 18, 24),
    createdAt: ts(11, 24, 12, 30),
    wordCount: 600,
  },
];

// 选项栏：与真实 DocSortOption 一致
const options: { key: SortKey; show: string }[] = [
  { key: "viewedAt", show: "最近浏览" },
  { key: "updatedAt", show: "最近更新" },
  { key: "createdAt", show: "最近创建" },
  { key: "wordCount", show: "最多字数" },
];

const sort = ref<SortKey>("viewedAt");

// 时间格式化：与真实 DocSortList 完全一致（含年份）
const dtf = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// 右侧关键信息：文档是主体，排序决定显示什么
const metaGetters: Record<SortKey, (d: DemoDoc) => string> = {
  viewedAt: (d) => dtf.format(new Date(d.viewedAt)),
  updatedAt: (d) => dtf.format(new Date(d.updatedAt)),
  createdAt: (d) => dtf.format(new Date(d.createdAt)),
  wordCount: (d) => `${d.wordCount} 字`,
};

// 按所选 sort option 真实排序：时间戳取最近在前，字数取最多在前
const sortedDocs = computed(() =>
  [...docs].sort((x, y) => {
    if (sort.value === "wordCount") return y.wordCount - x.wordCount;
    return y[sort.value] - x[sort.value];
  }),
);

const SWITCH = 2500; // 每个排序方式停留时长
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

onMounted(async () => {
  // 无障碍：偏好减弱动效时，静态展示第一个排序
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sort.value = "viewedAt";
    return;
  }
  for (;;) {
    for (const option of options) {
      sort.value = option.key;
      await sleep(SWITCH);
    }
  }
});
</script>

<template>
  <div
    ref="rootEl"
    class="demo-stage grid place-items-center rounded-card bg-linear-to-br from-ash via-canvas to-ash select-none"
    :style="{ '--demo-scale': demoScale }"
  >
    <!-- 统一槽位：800×464 画板（zoom 缩放单元），卡片 720 宽居中，四周各 40 内边距 -->
    <div class="demo-slot relative w-200 h-116 p-10">
      <div
        class="overflow-hidden rounded-2xl bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)]"
      >
        <!-- 选项栏：参照 DocSortOption，主题色与 SearchDemo 一致用 purple -->
        <div
          class="flex items-center h-16 px-5 gap-4 border-b border-purple-200"
        >
          <div
            v-for="i in options"
            :key="i.key"
            class="relative cursor-pointer"
          >
            <span :class="i.key === sort ? 'text-purple-700' : ''">
              {{ i.show }}
            </span>
            <div
              class="w-full h-1 absolute top-full left-0 rounded-full transition-opacity duration-200"
              :class="i.key === sort ? 'bg-purple-300' : 'opacity-0'"
            />
          </div>
        </div>

        <!-- 列表：完全参照 DocItem 行结构，顺序固定，切换排序时仅 meta 信息变化 -->
        <div>
          <div
            v-for="doc in sortedDocs"
            :key="doc.id"
            class="h-16 grid grid-cols-[4rem_1fr_auto] border-b border-neutral-100"
          >
            <!-- 图标 -->
            <div class="w-full h-full grid place-items-center">
              <div
                class="h-7 w-7 bg-surface-50 rounded-md grid place-items-center"
              >
                <component :is="doc.icon" class="size-5 text-neutral-400" />
              </div>
            </div>
            <!-- 标题与内容 -->
            <div class="w-full flex flex-col justify-center min-w-0">
              <div class="truncate">{{ doc.title }}</div>
              <div class="truncate text-xs text-neutral-400">
                {{ doc.content }}
              </div>
            </div>
            <!-- 关键信息：文档是主体，点击什么排序就显示什么关键信息 -->
            <div
              class="whitespace-nowrap px-4 text-right text-xs text-neutral-400 flex items-center"
            >
              {{ metaGetters[sort](doc) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
