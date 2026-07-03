const TARGET_PATH = "site-config.json";

function jsonResponse(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=utf-8",
      ...corsHeaders(request, env),
    },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  return {
    "access-control-allow-origin": allowedOrigin === "*" ? "*" : origin === allowedOrigin ? origin : allowedOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
  };
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function assertEnv(env) {
  const missing = ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "PUBLISH_SECRET"].filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing Worker env vars: ${missing.join(", ")}`);
  }
}

function isAuthorized(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token && token === env.PUBLISH_SECRET;
}

async function githubRequest(env, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "ai-pm-portfolio-worker",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || `GitHub API error ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function publishConfig(request, env) {
  assertEnv(env);
  if (!isAuthorized(request, env)) {
    return jsonResponse(request, env, { ok: false, error: "Unauthorized" }, 401);
  }

  const body = await request.json();
  const config = body.config;
  if (!config || typeof config !== "object" || !Array.isArray(config.projects)) {
    return jsonResponse(request, env, { ok: false, error: "Invalid site config" }, 400);
  }

  const branch = env.GITHUB_BRANCH || "main";
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const filePath = `/repos/${owner}/${repo}/contents/${TARGET_PATH}`;
  const current = await githubRequest(env, `${filePath}?ref=${encodeURIComponent(branch)}`);
  const content = `${JSON.stringify(config, null, 2)}\n`;
  const result = await githubRequest(env, filePath, {
    method: "PUT",
    body: JSON.stringify({
      branch,
      content: encodeBase64(content),
      message: `Update ${TARGET_PATH} from portfolio center`,
      sha: current.sha,
    }),
  });

  return jsonResponse(request, env, {
    ok: true,
    commit: result.commit?.html_url || "",
    content: result.content?.html_url || "",
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method !== "POST") {
      return jsonResponse(request, env, { ok: false, error: "Use POST /publish" }, 405);
    }
    try {
      return await publishConfig(request, env);
    } catch (error) {
      return jsonResponse(request, env, { ok: false, error: error.message || "Publish failed" }, 500);
    }
  },
};
