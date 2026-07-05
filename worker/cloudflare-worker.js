const TARGET_PATH = "site-config.json";
const RESUME_PATH = "assets/resume.pdf";
const AVATAR_BASE_PATH = "assets/avatar";

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

function dataUrlToBase64(dataUrl) {
  const match = String(dataUrl || "").match(/^data:application\/pdf(?:;[^,]*)?;base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid resume PDF file");
  }
  return match[1];
}

function imageDataUrlToAsset(dataUrl) {
  const match = String(dataUrl || "").match(/^data:image\/(png|jpe?g|webp|gif)(?:;[^,]*)?;base64,(.+)$/i);
  if (!match) {
    throw new Error("Invalid avatar image file");
  }
  const extension = match[1].toLowerCase().replace("jpeg", "jpg");
  return {
    path: `${AVATAR_BASE_PATH}.${extension}`,
    content: match[2],
  };
}

function decodeBase64Text(value) {
  const binary = atob(String(value || "").replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

async function getGithubJson(env, filePath, branch) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const path = `/repos/${owner}/${repo}/contents/${filePath}`;
  const current = await githubRequest(env, `${path}?ref=${encodeURIComponent(branch)}`);
  return JSON.parse(decodeBase64Text(current.content || ""));
}

async function putGithubContent(env, filePath, branch, content, message) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const path = `/repos/${owner}/${repo}/contents/${filePath}`;
  let sha = "";
  try {
    const current = await githubRequest(env, `${path}?ref=${encodeURIComponent(branch)}`);
    sha = current.sha || "";
  } catch (error) {
    if (!String(error.message || "").includes("Not Found")) {
      throw error;
    }
  }

  return githubRequest(env, path, {
    method: "PUT",
    body: JSON.stringify({
      branch,
      content,
      message,
      ...(sha ? { sha } : {}),
    }),
  });
}

async function publishConfig(request, env) {
  assertEnv(env);
  if (!isAuthorized(request, env)) {
    return jsonResponse(request, env, { ok: false, error: "Unauthorized" }, 401);
  }

  const body = await request.json();
  const config = body.config;
  const resumeFile = body.resumeFile;
  const avatarFile = body.avatarFile;
  const clearAvatar = body.clearAvatar === true;
  if (!config || typeof config !== "object" || !Array.isArray(config.projects)) {
    return jsonResponse(request, env, { ok: false, error: "Invalid site config" }, 400);
  }

  const branch = env.GITHUB_BRANCH || "main";
  let currentConfig = null;
  try {
    currentConfig = await getGithubJson(env, TARGET_PATH, branch);
  } catch {
    currentConfig = null;
  }

  if (resumeFile?.dataUrl) {
    await putGithubContent(env, RESUME_PATH, branch, dataUrlToBase64(resumeFile.dataUrl), `Update ${RESUME_PATH} from portfolio center`);
  }

  const avatarSource = avatarFile?.dataUrl || (String(config.avatar || "").startsWith("data:image/") ? config.avatar : "");
  if (avatarSource) {
    const avatar = imageDataUrlToAsset(avatarSource);
    await putGithubContent(env, avatar.path, branch, avatar.content, `Update ${avatar.path} from portfolio center`);
    config.avatar = `./${avatar.path}`;
  } else if (clearAvatar) {
    config.avatar = "";
  } else if (!config.avatar && currentConfig?.avatar) {
    config.avatar = currentConfig.avatar;
  }

  const content = `${JSON.stringify(config, null, 2)}\n`;
  const result = await putGithubContent(env, TARGET_PATH, branch, encodeBase64(content), `Update ${TARGET_PATH} from portfolio center`);

  return jsonResponse(request, env, {
    ok: true,
    commit: result.commit?.html_url || "",
    content: result.content?.html_url || "",
    config,
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
