<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import QRCode from "qrcode";

const fallbackApiRoot =
  typeof window === "undefined"
    ? "https://space.silkio.cn"
    : import.meta.env.DEV
      ? "http://localhost:8787"
      : window.location.origin;
const API_ROOT = (import.meta.env.PUBLIC_SYNC_API_BASE_URL || fallbackApiRoot)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");
const apiUrl = (path: string) => `${API_ROOT}/api${path}`;
const TOKEN_KEY = "silkio-space-session-token";

interface Plan {
  id: string;
  label: string;
  amountFen: number;
  amountYuan: number;
  durationDays: number;
  description: string;
}

interface PayOrder {
  outTradeNo: string;
  status: string;
  codeUrl: string;
  amountFen: number;
  expiresAtMs: number;
  transactionId: string;
}

const account = ref("");
const password = ref("");
const token = ref("");
const plans = ref<Plan[]>([]);
const selectedPlan = ref("month");
const qrDataUrl = ref("");
const order = ref<PayOrder | null>(null);
const statusText = ref("");
const busy = ref(false);
const message = ref("");
const isError = ref(false);

let pollTimer: number | undefined;
let polling = false;

const fieldClass =
  "h-10 w-full rounded-btn border border-hairline bg-white px-3 text-sm text-carbon outline-none transition-colors focus:border-primary";
const buttonClass =
  "tds-transition flex h-10 items-center justify-center rounded-btn bg-primary px-5 text-sm font-medium text-white hover:bg-[#3457b1] disabled:cursor-not-allowed disabled:opacity-60";

function setMessage(text: string, error = false) {
  message.value = text;
  isError.value = error;
}

function stopPolling() {
  if (pollTimer !== undefined) window.clearTimeout(pollTimer);
  pollTimer = undefined;
  polling = false;
}

async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token.value) headers.set("Authorization", `Bearer ${token.value}`);

  const response = await fetch(apiUrl(path), { ...options, headers });
  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("服务返回了无法识别的响应");
  }
  if (!response.ok || data.ok === false) {
    throw new Error(data.error?.message || data.message || `请求失败（HTTP ${response.status}）`);
  }
  return data;
}

async function loadPlans() {
  try {
    const data = await api("/pay/plans");
    plans.value = data.plans || [];
    if (plans.value.length && !plans.value.some((item) => item.id === selectedPlan.value)) {
      selectedPlan.value = plans.value[0].id;
    }
  } catch (error) {
    setMessage(error instanceof Error ? error.message : String(error), true);
  }
}

async function login() {
  if (busy.value) return;
  busy.value = true;
  setMessage("");
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ account: account.value.trim(), password: password.value }),
    });
    token.value = data.token;
    localStorage.setItem(TOKEN_KEY, data.token);
    password.value = "";
    setMessage("登录成功，请选择套餐。");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : String(error), true);
  } finally {
    busy.value = false;
  }
}

function orderStatusText(status: string) {
  if (status === "PAID") return "支付成功，同步权限已开通。";
  if (status === "CLOSED") return "订单已关闭。";
  if (status === "EXPIRED") return "二维码已过期，请刷新后重新扫码。";
  if (status === "FAILED") return "订单创建失败，请重新下单。";
  if (status === "USERPAYING") return "用户支付中，请稍候……";
  return "请使用微信扫码支付，支付完成后页面会自动更新。";
}

function schedulePoll(deadline: number) {
  if (Date.now() > deadline) {
    stopPolling();
    statusText.value = "支付确认超时，请刷新二维码后重新扫码。";
    return;
  }
  pollTimer = window.setTimeout(async () => {
    if (polling || !order.value) return;
    polling = true;
    try {
      const data = await api(
        `/pay/wechat/order?outTradeNo=${encodeURIComponent(order.value.outTradeNo)}`,
      );
      order.value = data.order;
      statusText.value = orderStatusText(data.order.status);
      if (data.order.status === "PAID") {
        stopPolling();
        setMessage("同步权限已开通，请回到桌面客户端使用。");
      } else if (["CLOSED", "EXPIRED", "FAILED"].includes(data.order.status)) {
        stopPolling();
      } else {
        schedulePoll(deadline);
      }
    } catch (error) {
      stopPolling();
      setMessage(error instanceof Error ? error.message : String(error), true);
    } finally {
      polling = false;
    }
  }, 2000);
}

async function startPurchase() {
  if (busy.value) return;
  stopPolling();
  busy.value = true;
  setMessage("");
  try {
    const data = await api("/pay/wechat/order", {
      method: "POST",
      body: JSON.stringify({ plan: selectedPlan.value }),
    });
    order.value = data.order;
    qrDataUrl.value = await QRCode.toDataURL(data.order.codeUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
    });
    statusText.value = orderStatusText(data.order.status);
    schedulePoll(Date.now() + 10 * 60 * 1000);
  } catch (error) {
    setMessage(error instanceof Error ? error.message : String(error), true);
  } finally {
    busy.value = false;
  }
}

function logout() {
  stopPolling();
  token.value = "";
  order.value = null;
  qrDataUrl.value = "";
  localStorage.removeItem(TOKEN_KEY);
  setMessage("已退出登录。");
}

onMounted(() => {
  token.value = localStorage.getItem(TOKEN_KEY) || "";
  const requested = new URLSearchParams(window.location.search).get("plan");
  if (requested) selectedPlan.value = requested;
  loadPlans();
});

onUnmounted(stopPolling);
</script>

<template>
  <div class="mx-auto max-w-xl">
    <div v-if="!token" class="flex flex-col gap-5">
      <p class="text-sm text-pewter">先登录 Silkio Space 账号，购买后权限会自动绑定到该账号。</p>
      <div class="field flex flex-col gap-1">
        <label for="purchase-account" class="text-sm font-medium text-carbon">账号</label>
        <input
          id="purchase-account"
          v-model.trim="account"
          name="account"
          type="text"
          required
          autocomplete="username"
          :class="fieldClass"
        />
      </div>
      <div class="field flex flex-col gap-1">
        <label for="purchase-password" class="text-sm font-medium text-carbon">密码</label>
        <input
          id="purchase-password"
          v-model="password"
          name="password"
          type="password"
          required
          autocomplete="current-password"
          :class="fieldClass"
        />
      </div>
      <button type="button" :disabled="busy" :class="buttonClass" @click="login">
        {{ busy ? "请稍候…" : "登录" }}
      </button>
      <p class="text-sm text-pewter">
        还没有账号？<a href="/register/" class="text-primary hover:underline">先注册</a>
        <span class="mx-2">·</span>
        <a href="/pricing/" class="text-primary hover:underline">查看完整定价</a>
      </p>
    </div>

    <div v-else class="flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-pewter">已登录，请选择同步权限套餐。</p>
        <button type="button" class="text-xs text-pewter hover:underline" @click="logout">退出</button>
      </div>

      <div class="flex flex-col gap-2">
        <label
          v-for="plan in plans"
          :key="plan.id"
          class="flex cursor-pointer items-center justify-between rounded-btn border px-4 py-3 text-sm"
          :class="selectedPlan === plan.id ? 'border-primary bg-[#f6f8ff]' : 'border-hairline'"
        >
          <input v-model="selectedPlan" type="radio" name="plan" :value="plan.id" class="mr-3" />
          <span class="flex-1 text-carbon">{{ plan.label }}</span>
          <span class="font-medium text-carbon">¥{{ plan.amountYuan.toFixed(2) }}</span>
        </label>
      </div>

      <button type="button" :disabled="busy || !plans.length" :class="buttonClass" @click="startPurchase">
        {{ busy ? "请稍候…" : "微信扫码支付" }}
      </button>

      <div v-if="qrDataUrl" class="flex flex-col items-center gap-3 rounded-btn border border-hairline p-6">
        <img :src="qrDataUrl" alt="微信支付二维码" class="h-60 w-60" />
        <p class="text-sm text-carbon">{{ statusText }}</p>
        <button type="button" class="text-xs text-primary hover:underline" @click="startPurchase">
          刷新二维码
        </button>
      </div>
    </div>

    <p
      v-if="message"
      role="status"
      aria-live="polite"
      class="mt-5 text-sm"
      :class="isError ? 'text-[#b42318]' : 'text-pewter'"
    >
      {{ message }}
    </p>
  </div>
</template>
