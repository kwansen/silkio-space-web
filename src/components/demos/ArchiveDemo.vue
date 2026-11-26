<script setup lang="ts">
// 官网演示版：多对多归档关系演示。
// 左侧 3 个归档、右侧 6 篇文档，SVG 曲线连接两者；
// 循环高亮某个归档：归档卡片与其关联连线、文档同步点亮，
// 体现"一个文档 · 多个归档 · 没有文件夹"。文档行结构参照 DocItem。
import { computed, onMounted, ref } from "vue";
import ArchiveIcon from "../../icons/Archive.vue";
import DocIcon from "../../icons/Doc.vue";
import FlowchartIcon from "../../icons/Flowchart.vue";
import MindmapIcon from "../../icons/Mindmap.vue";
import { useDemoScale } from "../../composables/useDemoScale";

const rootEl = ref<HTMLElement | null>(null);
const demoScale = useDemoScale(rootEl);

// 卡片内部几何（w-180=720px, h-96=384px，px-4 py-6）
// 左列归档：x 16~176，3 个 h-12 均分 justify-between，中心 y = 48/192/336
// 右列文档：窄列（w-56）靠右，x 从 480 起，6 行 h-12，中心 y = 48/105.6/163.2/220.8/278.4/336
const FOLDER_X = 176;
const FOLDER_YS = [48, 192, 336];
const DOC_X = 480;
const DOC_YS = [48, 105.6, 163.2, 220.8, 278.4, 336];

interface Folder {
  name: string;
}

interface DemoDoc {
  id: string;
  icon: typeof DocIcon;
  title: string;
  folders: number[]; // 关联的归档下标（多对多）
}

const folders: Folder[] = [
  { name: "阅读内化" },
  { name: "产品设计" },
  { name: "生活记录" },
];

const docs: DemoDoc[] = [
  { id: "a", icon: DocIcon, title: "《思考，快与慢》读书笔记", folders: [0, 1] },
  { id: "b", icon: FlowchartIcon, title: "婚礼筹备流程", folders: [0, 2] },
  { id: "c", icon: MindmapIcon, title: "心理学常见效应盘点", folders: [1] },
  { id: "d", icon: DocIcon, title: "爬虫性能优化实战", folders: [1] },
  { id: "e", icon: FlowchartIcon, title: "每周健身计划", folders: [2] },
  { id: "f", icon: DocIcon, title: "《卡片笔记写作法》摘录", folders: [0, 2] },
];

// 连线：立方贝塞尔，从归档右缘到文档左缘
const edgePath = (fy: number, dy: number) =>
  `M ${FOLDER_X} ${fy} C ${FOLDER_X + 48} ${fy}, ${DOC_X - 48} ${dy}, ${DOC_X} ${dy}`;

const edges = computed(() =>
  docs.flatMap((doc, di) =>
    doc.folders.map((fi) => ({
      key: `${doc.id}-${fi}`,
      d: edgePath(FOLDER_YS[fi], DOC_YS[di]),
      folder: fi,
      doc: doc.id,
    })),
  ),
);

const SWITCH = 2500; // 每个归档的停留时长
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 当前高亮的归档下标
const activeFolder = ref(-1);

onMounted(async () => {
  // 无障碍：偏好减弱动效时，不高亮，静态展示全部连线
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    activeFolder.value = -1;
    return;
  }
  for (;;) {
    for (let i = 0; i < folders.length; i++) {
      activeFolder.value = i;
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
    <!-- 统一槽位：800×464 画板（zoom 缩放单元），卡片 720×384 居中，四周各 40 内边距 -->
    <div class="demo-slot relative w-200 h-116 p-10">
      <div
        class="w-full h-full overflow-hidden rounded-2xl bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)]"
      >
        <div class="flex h-full px-4 py-6 gap-8">
          <!-- 左列：3 个归档 -->
          <div class="w-40 flex flex-col justify-between shrink-0">
            <div
              v-for="(folder, fi) in folders"
              :key="folder.name"
              class="h-12 flex items-center gap-2 px-3 rounded-lg border transition-colors duration-300"
              :class="
                fi === activeFolder
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-canvas border-hairline text-carbon'
              "
            >
              <ArchiveIcon
                class="size-4 transition-colors duration-300"
                :class="
                  fi === activeFolder ? 'text-purple-700' : 'text-neutral-400'
                "
              />
              <span class="text-xs font-medium">{{ folder.name }}</span>
            </div>
          </div>

          <!-- 右列：6 篇文档（窄列靠右，中间留出连线空间） -->
          <div class="flex-1"></div>
          <div class="w-56 flex flex-col justify-between shrink-0">
            <div
              v-for="doc in docs"
              :key="doc.id"
              class="h-12 flex items-center gap-2 px-3 rounded-lg border transition-colors duration-300"
              :class="
                doc.folders.includes(activeFolder)
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-canvas border-hairline'
              "
            >
              <div
                class="size-7 bg-surface-50 rounded-md grid place-items-center shrink-0"
              >
                <component :is="doc.icon" class="size-4 text-neutral-400" />
              </div>
              <span class="text-xs text-carbon truncate">{{ doc.title }}</span>
            </div>
          </div>
        </div>

        <!-- 连线层：覆盖整卡，多对多曲线；高亮归档时其连线变紫 -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 720 384"
        >
          <path
            v-for="edge in edges"
            :key="edge.key"
            :d="edge.d"
            fill="none"
            class="transition-all duration-300"
            :stroke="edge.folder === activeFolder ? '#a78bfa' : '#c8ccd4'"
            :stroke-width="edge.folder === activeFolder ? 2 : 1.5"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
