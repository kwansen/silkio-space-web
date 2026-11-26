import { onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * 演示区等比缩放：绘制板固定 720×384，背景板设计尺寸 800×464（左右各 40 内边距），
 * 缩放系数 = 外层背景板宽度 / 800（连续、随窗口实时变化，上限 1）。
 * 用法：<div ref="rootEl" :style="{ '--demo-scale': demoScale }">
 */
export function useDemoScale(rootEl: Ref<HTMLElement | null>) {
  const scale = ref(1);
  let ro: ResizeObserver | null = null;

  const update = () => {
    const el = rootEl.value;
    if (el) scale.value = Math.min(1, el.clientWidth / 800);
  };

  onMounted(() => {
    update();
    ro = new ResizeObserver(update);
    if (rootEl.value) ro.observe(rootEl.value);
  });
  onUnmounted(() => ro?.disconnect());

  return scale;
}
