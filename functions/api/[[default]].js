const DEFAULT_UPSTREAM_ORIGIN =
  "https://genuine-baboon-d7ghxblwk187584b1-1309649364.ap-shanghai.app.tcloudbase.com";

const REQUEST_HEADERS_TO_DROP = [
  "host",
  "origin",
  "referer",
  "cookie",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
];

const RESPONSE_HEADERS_TO_DROP = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
];

function withoutHeaders(headers, names) {
  const result = new Headers(headers);
  for (const name of names) result.delete(name);
  return result;
}

function buildUpstreamUrl(request, env) {
  const configuredOrigin =
    env && typeof env.CLOUDBASE_API_ORIGIN === "string"
      ? env.CLOUDBASE_API_ORIGIN.trim()
      : "";
  const origin = (configuredOrigin || DEFAULT_UPSTREAM_ORIGIN).replace(
    /\/+$/,
    "",
  );
  const incoming = new URL(request.url);
  return new URL(`${incoming.pathname}${incoming.search}`, origin);
}

function proxyError() {
  return new Response(
    JSON.stringify({
      ok: false,
      error: {
        code: "API_PROXY_FAILED",
        message: "API 代理请求失败，请稍后重试",
      },
    }),
    {
      status: 502,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "cdn-cache-control": "no-store",
      },
    },
  );
}

export async function onRequest(context) {
  try {
    const { request, env } = context || {};
    const target = buildUpstreamUrl(request, env);
    const method = String(request.method || "GET").toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD";
    const requestHeaders = withoutHeaders(
      request.headers,
      REQUEST_HEADERS_TO_DROP,
    );

    const upstreamResponse = await fetch(target.toString(), {
      method,
      headers: requestHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      eo: {
        timeoutSetting: {
          connectTimeout: 5000,
          readTimeout: 30000,
          writeTimeout: 30000,
        },
      },
    });

    const responseHeaders = withoutHeaders(
      upstreamResponse.headers,
      RESPONSE_HEADERS_TO_DROP,
    );
    responseHeaders.set("cache-control", "no-store, max-age=0");
    responseHeaders.set("cdn-cache-control", "no-store");
    responseHeaders.set("pragma", "no-cache");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[silkio-api-proxy]", error);
    return proxyError();
  }
}
