const TARGET_PATH = "site-config.json";
const RESUME_PATH = "assets/resume.pdf";
const AVATAR_BASE_PATH = "assets/avatar";

function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, authorization");
  res.setHeader("access-control-max-age", "86400");
}

function json(res, status, data) {
  setCors(res);
  res.status(status).json(data);
}

function assertEnv() {
  const missing = ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "PUBLISH_SECRET"].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}

function isAuthorized(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token && token === process.env.PUBLISH_SECRET;
}

function encodeBase64(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function decodeBase64Text(value) {
  return Buffer.from(String(value || "").replace(/\s/g, ""), "base64").toString("utf8");
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

function withVersion(path, version) {
  const cleanPath = String(path || "").split("?")[0];
  return `${cleanPath}?v=${version}`;
}

function isResumeContact(contact) {
  return Boolean(contact?.primary || String(contact?.url || "").includes(RESUME_PATH) || String(contact?.download || "").includes(".pdf"));
}

function versionResumeContact(config, version, downloadName) {
  if (!Array.isArray(config.contacts)) return;
  const contact = config.contacts.find(isResumeContact);
  if (!contact) return;
  contact.url = withVersion(`./${RESUME_PATH}`, version);
  contact.download = downloadName || contact.download || "resume.pdf";
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "ai-pm-portfolio-vercel",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || `GitHub API error ${response.status}`);
  }
  return data;
}

async function getGithubJson(filePath, branch) {
  const path = `/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`;
  const current = await githubRequest(`${path}?ref=${encodeURIComponent(branch)}`);
  return JSON.parse(decodeBase64Text(current.content || ""));
}

async function putGithubContent(filePath, branch, content, message) {
  const path = `/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`;
  let sha = "";
  try {
    const current = await githubRequest(`${path}?ref=${encodeURIComponent(branch)}`);
    sha = current.sha || "";
  } catch (error) {
    if (!String(error.message || "").includes("Not Found")) {
      throw error;
    }
  }

  return githubRequest(path, {
    method: "PUT",
    body: JSON.stringify({
      branch,
      content,
      message,
      ...(sha ? { sha } : {}),
    }),
  });
}

async function publishConfig(req, res) {
  assertEnv();
  if (!isAuthorized(req)) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const config = body.config;
  const resumeFile = body.resumeFile;
  const avatarFile = body.avatarFile;
  const clearAvatar = body.clearAvatar === true;
  if (!config || typeof config !== "object" || !Array.isArray(config.projects)) {
    return json(res, 400, { ok: false, error: "Invalid site config" });
  }

  const branch = process.env.GITHUB_BRANCH || "main";
  const assetVersion = Date.now();
  let currentConfig = null;
  try {
    currentConfig = await getGithubJson(TARGET_PATH, branch);
  } catch {
    currentConfig = null;
  }

  if (resumeFile?.dataUrl) {
    await putGithubContent(RESUME_PATH, branch, dataUrlToBase64(resumeFile.dataUrl), `Update ${RESUME_PATH} from portfolio center`);
    versionResumeContact(config, assetVersion, resumeFile.name);
  }

  const avatarSource = avatarFile?.dataUrl || (String(config.avatar || "").startsWith("data:image/") ? config.avatar : "");
  if (avatarSource) {
    const avatar = imageDataUrlToAsset(avatarSource);
    await putGithubContent(avatar.path, branch, avatar.content, `Update ${avatar.path} from portfolio center`);
    config.avatar = withVersion(`./${avatar.path}`, assetVersion);
  } else if (clearAvatar) {
    config.avatar = "";
  } else if (!config.avatar && currentConfig?.avatar) {
    config.avatar = currentConfig.avatar;
  }

  const content = `${JSON.stringify(config, null, 2)}\n`;
  const result = await putGithubContent(TARGET_PATH, branch, encodeBase64(content), `Update ${TARGET_PATH} from portfolio center`);

  return json(res, 200, {
    ok: true,
    commit: result.commit?.html_url || "",
    content: result.content?.html_url || "",
    config,
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Use POST /api/publish" });
  }
  try {
    return await publishConfig(req, res);
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || "Publish failed" });
  }
};
