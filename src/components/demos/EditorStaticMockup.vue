<!-- Static mockup: rich text editor with inline flowchart and mini mind map. -->
<template>
  <div class="rounded-xl border border-hairline bg-white p-5 shadow-sm">
    <div class="h-3 w-24 rounded bg-carbon/70"></div>
    <div class="mt-3 space-y-2">
      <div class="h-2 w-full rounded bg-ash"></div>
      <div class="h-2 w-5/6 rounded bg-ash"></div>
      <div class="h-2 w-2/3 rounded bg-ash"></div>
    </div>
    <div class="mt-5 flex items-center gap-2">
      <span class="rounded-lg border border-hairline bg-canvas px-3 py-2 text-[10px] text-carbon">想法</span>
      <span class="h-px w-4 bg-graphite/40"></span>
      <span class="rounded-lg border border-hairline bg-canvas px-3 py-2 text-[10px] text-carbon">整理</span>
      <span class="h-px w-4 bg-graphite/40"></span>
      <span class="rounded-lg border border-primary bg-primary/10 px-3 py-2 text-[10px] text-primary">内化</span>
    </div>
    <svg viewBox="0 0 280 70" class="mt-5 w-full">
      <line x1="70" y1="35" x2="150" y2="12" stroke="#c8ccd4" stroke-width="1.5" />
      <line x1="70" y1="35" x2="150" y2="58" stroke="#c8ccd4" stroke-width="1.5" />
      <line x1="150" y1="12" x2="230" y2="35" stroke="#c8ccd4" stroke-width="1.5" />
      <rect x="20" y="23" width="50" height="24" rx="6" fill="#eef1f6" />
      <rect x="150" y="0" width="50" height="24" rx="6" fill="#eef1f6" />
      <rect x="150" y="46" width="50" height="24" rx="6" fill="#eef1f6" />
      <rect x="230" y="23" width="44" height="24" rx="6" fill="#3b5bd6" opacity="0.9" />
    </svg>
  </div>
</template>
