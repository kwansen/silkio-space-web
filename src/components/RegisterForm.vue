<script setup lang="ts">
import { ref } from "vue";

const API_ROOT = (
  import.meta.env.PUBLIC_SYNC_API_BASE_URL || "http://localhost:8787"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");
const apiUrl = (path: string) => `${API_ROOT}/api${path}`;

const email = ref("");
const password = ref("");
const code = ref("");
const verificationId = ref("");
const stage = ref<"form" | "code" | "done">("form");
const busy = ref(false);
const message = ref("");
const isError = ref(false);
const showPassword = ref(false);

const fieldClass =
  "h-10 w-full rounded-btn border border-hairline bg-white px-3 text-sm text-carbon outline-none transition-colors focus:border-primary";
const buttonClass =
  "tds-transition flex h-10 items-center justify-center rounded-btn bg-primary px-5 text-sm font-medium text-white hover:bg-[#3457b1] disabled:cursor-not-allowed disabled:opacity-60";

async function post(path: string, body: Record<string, unknown>) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data: {
    ok?: boolean;
    verificationId?: string;
    message?: string;
    error?: { message?: string };
  } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("服务返回了无法识别的响应");
  }
  if (!response.ok || data.ok === false) {
    throw new Error(data.error?.message || data.message || "请求失败，请稍后重试");
  }
  return data;
}

async function requestCode() {
  if (busy.value) return;
  busy.value = true;
  message.value = "";
  isError.value = false;
  try {
    const data = await post("/auth/register", { email: email.value.trim() });
    verificationId.value = data.verificationId || "";
    stage.value = "code";
    message.value = data.message || "验证码已发送，请查收邮箱";
  } catch (error) {
    isError.value = true;
    message.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}

async function confirmRegister() {
  if (busy.value) return;
  busy.value = true;
  message.value = "";
  isError.value = false;
  try {
    const data = await post("/auth/register/confirm", {
      email: email.value.trim(),
      password: password.value,
      code: code.value.trim(),
      verificationId: verificationId.value,
    });
    stage.value = "done";
    password.value = "";
    code.value = "";
    message.value = data.message || "注册成功";
  } catch (error) {
    isError.value = true;
    message.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <form
      v-if="stage !== 'done'"
      class="flex flex-col gap-5"
      :aria-busy="busy"
      @submit.prevent="stage === 'form' ? requestCode() : confirmRegister()"
    >
      <div class="field flex flex-col gap-1">
        <label for="register-email" class="text-sm font-medium text-carbon">邮箱</label>
        <span id="register-email-hint" class="text-xs text-pewter">
          用于登录 Silkio Space，请输入常用邮箱。
        </span>
        <input
          id="register-email"
          v-model.trim="email"
          name="email"
          type="email"
          required
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          enterkeyhint="next"
          aria-describedby="register-email-hint"
          data-error="register-email-error"
          :class="fieldClass"
          :disabled="stage === 'code'"
        />
        <div id="register-email-error" class="error-msg">
          错误：请输入 you@example.com 格式的邮箱地址。
        </div>
      </div>

      <div v-if="stage === 'form'" class="field flex flex-col gap-1">
        <label for="register-password" class="text-sm font-medium text-carbon">密码</label>
        <ul id="register-password-rules" class="rules-list text-xs text-pewter">
          <li>8-32 位</li>
          <li>同时包含字母和数字</li>
        </ul>
        <div class="flex items-center gap-2">
          <input
            id="register-password"
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            maxlength="32"
            pattern="(?=.*[A-Za-z])(?=.*\d).{8,32}"
            autocomplete="new-password"
            enterkeyhint="done"
            aria-describedby="register-password-rules"
            data-error="register-password-error"
            :class="fieldClass"
          />
          <button
            type="button"
            :aria-pressed="showPassword"
            class="tds-transition h-10 shrink-0 rounded-btn border border-hairline px-3 text-xs text-pewter hover:bg-ash"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "隐藏" : "显示" }}
          </button>
        </div>
        <div id="register-password-error" class="error-msg">
          错误：密码需为 8-32 位，且同时包含字母和数字。
        </div>
      </div>

      <div v-else class="field flex flex-col gap-1">
        <label for="register-code" class="text-sm font-medium text-carbon">邮箱验证码</label>
        <span id="register-code-hint" class="text-xs text-pewter">
         验证码已发送到 {{ email }}，请输入后完成注册。
        </span>
        <input
          id="register-code"
          v-model.trim="code"
          name="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          required
          enterkeyhint="done"
          aria-describedby="register-code-hint"
          data-error="register-code-error"
          :class="fieldClass"
        />
        <div id="register-code-error" class="error-msg">错误：请输入收到的验证码。</div>
      </div>

      <div class="flex items-center gap-3">
        <button type="submit" :disabled="busy" :class="buttonClass">
          {{ busy ? "请稍候…" : stage === "form" ? "发送验证码" : "完成注册" }}
        </button>
        <button
          v-if="stage === 'code'"
          type="button"
          class="tds-transition text-sm text-primary hover:underline"
          :disabled="busy"
          @click="stage = 'form'"
        >
          返回修改
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        class="text-sm"
        :class="isError ? 'text-[#b42318]' : 'text-pewter'"
      >
        {{ message }}
      </p>
    </form>

    <div v-else class="flex flex-col items-start gap-3">
      <h2 class="text-lg font-medium text-carbon">注册成功</h2>
      <p class="text-sm text-pewter">请回到桌面客户端，使用邮箱和密码登录。</p>
      <a href="/" class="tds-transition text-sm text-primary hover:underline">返回首页</a>
    </div>
  </div>
</template>

<style scoped>
.error-msg {
  display: none;
  color: #b42318;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.field :is(input:user-invalid, input.user-invalid-fallback) {
  border-color: #b42318;
  background-color: #fff5f4;
}

.field:has(input:user-invalid) .error-msg,
.field:has(input.user-invalid-fallback) .error-msg {
  display: block;
}

.field:has(input:user-invalid) .rules-list {
  color: #b42318;
  font-weight: 600;
}
</style>
