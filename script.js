const CENTER_PASS = "6540064aa";
const CONFIG_KEY = "portfolioConfig";
const CENTER_AUTH_KEY = "portfolioCenterAuthedUntil";
const PUBLISH_ENDPOINT_KEY = "portfolioPublishEndpoint";
const PUBLISH_SECRET_KEY = "portfolioPublishSecret";
const DEFAULT_PUBLISH_ENDPOINT = "https://ai-pm-portfolio-publisher.lilibin-ai-pm.workers.dev";
const RESUME_ASSET_PATH = "./assets/resume.pdf";
const RESUME_DOWNLOAD_NAME = "李丽斌-产品经理.pdf";
const CONFIG_VERSION = 2;
const CONFIG_URL = "./site-config.json";
let pendingResumeFile = null;
let pendingAvatarFile = null;
let avatarShouldClear = false;

function resolvePublishEndpoint() {
  const stored = localStorage.getItem(PUBLISH_ENDPOINT_KEY) || "";
  try {
    const url = new URL(stored);
    if (url.protocol === "https:" && url.hostname.endsWith(".workers.dev")) {
      return stored;
    }
  } catch (error) {
    // Ignore stale local values from earlier setup attempts.
  }
  localStorage.setItem(PUBLISH_ENDPOINT_KEY, DEFAULT_PUBLISH_ENDPOINT);
  return DEFAULT_PUBLISH_ENDPOINT;
}

const defaultConfig = {
  version: CONFIG_VERSION,
  brandName: "李婧斐 - AI 产品经理简历",
  avatar: "",
  hero: {
    title: "用 AI、数据与行业场景，推动 B 端产品落地。",
    summary:
      "10 年产品与 UX 经验，长期服务运营商、研究院、政府与 B 端行业客户。熟悉 RAG、AI Agent、提示词工程与农业大模型应用，擅长从业务调研、方案设计、数据治理到项目验收的端到端推进。",
    primaryLabel: "查看重点项目",
    tags: ["AI 产品经理", "B 端产品", "数字乡村", "RAG / Agent"],
  },
  agent: {
    eyebrow: "Ask My Portfolio Agent",
    title: "让面试官直接询问我的 AI 产品思考",
    summary:
      "这里预留个人作品集 Agent。后续可以接入模型，让面试官围绕数字乡村、农业大模型、B 端系统设计和 AI 产品方法论进行问答。",
    status: "个人作品集 Agent · 待接入",
    welcome:
      "你好，我是预留的个人作品集 Agent。你可以问我：最有代表性的 AI 项目是什么、如何评估 AI 输出质量、如何设计 Agent 失败兜底。",
    prompts: [
      "你最有代表性的 AI 项目是什么？",
      "你在农业大模型项目中负责了什么？",
      "你如何评估 AI 输出质量？",
      "你为什么适合 AI 产品经理？",
    ],
  },
  projectsSection: {
    eyebrow: "AI Case Studies",
    title: "AI 项目案例",
    summary:
      "每个项目围绕用户任务、AI 介入点、模型/Agent 方案、评估指标与风险控制展开，让面试官看到完整的 AI 产品判断链路。",
  },
  projects: [
    {
      id: "agri-llm-platform",
      type: "AI 产品",
      filter: "ai",
      title: "中移谷丰登农事服务大模型",
      summary:
        "中国移动成研院 CHBN 重点智慧农业项目，打造空天地一体化农事管理平台，配套农业垂直大模型。",
      image: "",
      points: [
        "负责后台整体架构，完成首页、农场管理、可视化监控、自动化生产等模块规划",
        "规整多源标准化农业数据集，支撑 SFT 行业微调与人工反馈对齐迭代",
        "项目通过中国移动集团总部验收，覆盖 300 万亩高标准农田",
      ],
      detail:
        "担任项目产品负责人，统筹后台整体架构设计，完成农场、地块、作物、物联网设备标准化管理能力，解决底层数据杂乱、标签不统一的问题；搭建政企可视化监控大屏，融合卫星遥感全域影像与田间传感器点位数据；落地自动化农事作业、消息预警推送、权限管理和农田时序数据沉淀；同步收集农户、农艺师对 AI 农技方案的人工反馈，并规整多源标准化农业数据集供给农业垂直大模型，支撑 SFT 行业微调与人工反馈对齐迭代。项目入选移动数字乡村标杆解决方案白皮书，配套 AI 病害识别、农技方案输出准确率提升 16%。",
    },
    {
      id: "rural-revitalization-platform",
      type: "B 端平台",
      filter: "b2b",
      title: "中国移动乡村振兴平台项目",
      summary:
        "中国移动 CHBN 重点项目，围绕乡村振兴评价指标体系，建设多地区可部署的二级平台。",
      image: "",
      points: [
        "与爱立信等咨询公司协作，制订中国移动乡村振兴平台发展路径",
        "设计产业兴旺、生态宜居、乡风文明、治理有效、生活富裕五类数据大屏",
        "项目入选中国移动乡村振兴产品白皮书，并在多地部署推广",
      ],
      detail:
        "作为项目负责人，独立完成市场需求调研，结合学术文献设计乡村振兴评价指标体系，并据此构建平台产品。完成产业兴旺、生态宜居、乡风文明、治理有效、生活富裕五类数据大屏设计，共计 44 个指导性指标；设计指标动态配置、权重配置、数据接入和应用接入等功能模块，兼容地方个性化需求；输出乡村振兴解决方案及配套文档，协作甲方按时完成阶段性验收，并推动山东枣庄、贵州贵阳、四川广元、山西太谷等地区二级平台部署。",
    },
    {
      id: "connected-agri-machine",
      type: "5G / IoT",
      filter: "b2b",
      title: "中国移动网联农机项目",
      summary:
        "以 5G 智能终端与农机结合，完成农机作业监管、位置工况采集和作业数据分析产品设计。",
      image: "",
      points: [
        "两周内完成农机作业监管需求调研，梳理核心业务流程和功能架构",
        "设计农机管理、机具管理、农机手管理、作业监控、作业总览等模块",
        "项目通过中国移动集团总部验收，并在黑龙江建三江农场成功试点",
      ],
      detail:
        "作为项目负责人，梳理项目目标并输出项目方案，协助甲方完成内部立项；完成农机管理、机具管理、农机手管理、故障管理、作业管理、作业监控和作业总览等功能模块设计；输出农机自动测亩技术调研报告，对接甲方算法团队完成算法研发；输出网联农机解决方案及配套文档，协作甲方按时完成项目验收。",
    },
    {
      id: "aica-class-management",
      type: "教育产品",
      filter: "b2b",
      title: "新讯 AICA 班级智慧管理小程序",
      summary:
        "从零规划智慧教育产品线，聚焦精准教学、家校互动、学生发展三类班级管理核心场景。",
      image: "",
      points: [
        "完成成绩私发、填表统计、投票、接龙、打卡、班级作业等 30+ 工具设计",
        "综合研发实力、项目积累和客情关系，规划公司内部智慧教育产品线",
        "推动小程序成功上线内测，现已积累用户 500+",
      ],
      detail:
        "负责公司内部智慧教育产品线，综合部门研发实力、项目积累、客情关系，从零规划班级智慧管理微信小程序，聚焦精准教学、家校互动、学生发展三类班级管理核心场景，完成成绩私发、填表统计、投票、接龙、打卡、班级作业、单词听写等 30+ 班级管理工具的产品设计，并推动小程序上线内测。",
    },
  ],
  capabilitiesSection: {
    eyebrow: "AI PM Skill Map",
    title: "AI 产品经理能力矩阵",
    summary:
      "把 AI 产品经理能力拆成面试官能判断的具体行为：从场景判断、LLM 设计到评估闭环和风险控制。",
  },
  capabilities: [
    { title: "行业 AI 场景落地", text: "熟悉农业、数字乡村、教育、B 端管理系统等场景，能把 AI 能力转化为业务流程与产品模块。" },
    { title: "RAG / Agent 理解", text: "熟悉 RAG、AI Agent、提示词工程等大模型应用技术，了解预训练、SFT、RLHF 等训练原理。" },
    { title: "项目交付与验收", text: "熟悉运营商、研究院、政府部门的立项、执行、验收、汇报流程，能推进跨方协作落地。" },
    { title: "产品与设计工具", text: "精通 Figma、Axure、墨刀、Xmind、Tableau 等工具，具备产品设计与 UI/UX 全链路经验。" },
  ],
  thinking: {
    eyebrow: "AI Product Notes",
    title: "AI 产品思考",
    summary: "放置高质量产品拆解、AI 项目复盘和方法论文章，展示持续思考与判断力。",
    notes: [
      { type: "方法论", title: "我如何判断一个需求是否适合用大模型", url: "#" },
      { type: "Agent 设计", title: "AI Agent 产品设计中的任务拆解与失败兜底", url: "#" },
      { type: "评估体系", title: "AI 产品如何评估输出质量，而不只看用户觉得好不好", url: "#" },
    ],
  },
  resume: {
    eyebrow: "Resume",
    title: "教育与工作经历",
    summary: "10 年产品与 UX 经验，覆盖运营商、数字农业、智慧教育、政府平台、B 端管理系统等项目。",
    education: [
      {
        school: "四川师范大学",
        degree: "通信工程 · 本科",
        time: "2012 - 2016",
        detail: "通信工程专业背景，具备技术理解和跨职能沟通基础。",
      },
    ],
    work: [
      {
        company: "新讯数字科技（杭州）有限公司成都分公司",
        role: "产品经理",
        time: "2019.11 - 2026.01",
        detail: "负责中移谷丰登农事服务大模型、中国移动乡村振兴平台、网联农机、智慧养猪、区块链农产品溯源、AICA 班级智慧管理小程序等项目。",
      },
      {
        company: "中软国际（中国）科技有限公司",
        role: "UX / 交互设计师",
        time: "2018.11 - 2019.03",
        detail: "负责元件管理系统 UI/UX 全流程设计，支撑元件管理、电路设计相关 B 端业务数字化体验升级。",
      },
      {
        company: "四川驿停车智慧科技有限公司",
        role: "UI 设计师",
        time: "2018.04 - 2018.10",
        detail: "负责 B 端停车管理系统及客服服务系统的 UI/UX 全流程设计，推动办公与服务数字化体验升级。",
      },
      {
        company: "软通动力信息技术（集团）股份有限公司",
        role: "UX / 交互设计师",
        time: "2016.06 - 2018.03",
        detail: "负责教育数字化、党建、企业 IM、物联网等多赛道项目 UI/UX 设计，核心项目包含光明新区智慧教育云平台等。",
      },
    ],
  },
  contacts: [
    { label: "15708464600", url: "tel:15708464600" },
    { label: "15708464600@163.com", url: "mailto:15708464600@163.com" },
    { label: "下载简历", url: RESUME_ASSET_PATH, primary: true, download: RESUME_DOWNLOAD_NAME },
  ],
};

let editorState = null;
let repositoryConfig = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadRepositoryConfig() {
  try {
    const response = await fetch(`${CONFIG_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const parsed = await response.json();
    repositoryConfig = normalizeConfig(mergeConfig(clone(defaultConfig), parsed));
  } catch {
    repositoryConfig = null;
  }
}

function readConfig() {
  const baseConfig = repositoryConfig || defaultConfig;
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return clone(baseConfig);
  try {
    const parsed = JSON.parse(raw);
    if ((parsed.version || 0) < CONFIG_VERSION) return clone(baseConfig);
    return normalizeConfig(mergeConfig(clone(baseConfig), parsed));
  } catch {
    return clone(baseConfig);
  }
}

function mergeConfig(base, updates) {
  Object.entries(updates || {}).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value) && base[key]) {
      base[key] = mergeConfig(base[key], value);
    } else {
      base[key] = value;
    }
  });
  return base;
}

function normalizeConfig(config) {
  config.projects = (config.projects || []).map((project, index) => ({
    ...project,
    id: project.id || `project-${Date.now()}-${index}`,
    points: Array.isArray(project.points) ? project.points : linesToArray(project.points),
    detail: project.detail || project.summary || "",
    image: project.image || "",
  }));
  config.resume.education = config.resume.education || [];
  config.resume.work = config.resume.work || [];
  config.contacts = (config.contacts || []).map((contact) => ({
    ...contact,
    download: contact.download === true ? RESUME_DOWNLOAD_NAME : contact.download,
  }));
  config.avatar = config.avatar || "";
  return config;
}

function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizeConfig(config), null, 2));
    return true;
  } catch {
    return false;
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function publishToGithub(config, endpoint, secret, files = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ config, ...files }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `发布失败：${response.status}`);
  }
  return data;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element && text !== undefined) element.textContent = text;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToLines(value) {
  return (value || []).join("\n");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function cropAvatarToSquare(file) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImageFromDataUrl(dataUrl);
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.round((image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.round((image.naturalHeight - sourceSize) / 2);
  const outputSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
  return canvas.toDataURL("image/png");
}

function renderAvatar(config) {
  document.querySelectorAll("#siteAvatar").forEach((img) => {
    img.src = config.avatar || "";
    img.hidden = !config.avatar;
  });
  document.querySelectorAll(".avatar-fallback").forEach((fallback) => {
    fallback.hidden = !!config.avatar;
  });
}

function renderPublicSite() {
  if (!document.querySelector("#projectGrid")) return;
  const config = readConfig();
  setText(".brand a span", config.brandName);
  setText("#heroTitle", config.hero.title);
  setText("#heroSummary", config.hero.summary);
  setText("#heroPrimary", config.hero.primaryLabel);
  setText("#agentEyebrow", config.agent.eyebrow);
  setText("#agentTitle", config.agent.title);
  setText("#agentSummary", config.agent.summary);
  setText("#agentStatus", config.agent.status);
  setText("#agentWelcome", config.agent.welcome);
  setText("#projectsEyebrow", config.projectsSection.eyebrow);
  setText("#projectsTitle", config.projectsSection.title);
  setText("#projectsSummary", config.projectsSection.summary);
  setText("#capabilitiesEyebrow", config.capabilitiesSection.eyebrow);
  setText("#capabilitiesTitle", config.capabilitiesSection.title);
  setText("#capabilitiesSummary", config.capabilitiesSection.summary);
  setText("#thinkingEyebrow", config.thinking.eyebrow);
  setText("#thinkingTitle", config.thinking.title);
  setText("#thinkingSummary", config.thinking.summary);
  setText("#resumeEyebrow", config.resume.eyebrow);
  setText("#resumeTitle", config.resume.title);
  setText("#resumeSummary", config.resume.summary);
  renderAvatar(config);
  renderHeroTags(config.hero.tags);
  renderAgentPrompts(config.agent.prompts);
  renderProjects(config.projects);
  renderCapabilities(config.capabilities);
  renderNotes(config.thinking.notes);
  renderResumeTimeline(config.resume);
  renderContacts(config.contacts);
  bindPublicInteractions();
}

function renderHeroTags(tags) {
  const container = document.querySelector("#heroTags");
  if (!container) return;
  container.replaceChildren(...tags.map((tag) => createElement("span", "", tag)));
}

function renderAgentPrompts(prompts) {
  const container = document.querySelector("#agentPrompts");
  if (!container) return;
  container.replaceChildren(
    ...prompts.map((prompt) => {
      const button = createElement("button", "", prompt);
      button.type = "button";
      button.dataset.prompt = prompt;
      return button;
    }),
  );
}

function renderProjects(projects) {
  const toolbar = document.querySelector("#projectToolbar");
  const grid = document.querySelector("#projectGrid");
  if (!toolbar || !grid) return;
  const filters = [["all", "全部"]];
  projects.forEach((project) => {
    if (!filters.some(([filter]) => filter === project.filter)) filters.push([project.filter, project.type]);
  });
  toolbar.replaceChildren(
    ...filters.map(([filter, label], index) => {
      const button = createElement("button", `filter-button${index === 0 ? " active" : ""}`, label);
      button.type = "button";
      button.dataset.filter = filter;
      return button;
    }),
  );
  grid.replaceChildren(
    ...projects.map((project) => {
      const article = createElement("article", "project-card");
      article.dataset.type = project.filter;
      if (project.image) {
        const image = createElement("img", "project-card-image");
        image.src = project.image;
        image.alt = project.title;
        article.append(image);
      }
      article.append(createElement("p", "project-type", project.type), createElement("h3", "", project.title), createElement("p", "", project.summary));
      const list = createElement("ul");
      (project.points || []).forEach((point) => list.append(createElement("li", "", point)));
      const action = createElement("a", "secondary-button project-detail-button", "查看详情");
      action.href = `./project-detail.html?id=${encodeURIComponent(project.id)}`;
      article.append(list, action);
      return article;
    }),
  );
}

function renderCapabilities(capabilities) {
  const grid = document.querySelector("#capabilityGrid");
  if (!grid) return;
  grid.replaceChildren(
    ...capabilities.map((item, index) => {
      const article = createElement("article");
      article.append(createElement("span", "", String(index + 1).padStart(2, "0")), createElement("h3", "", item.title), createElement("p", "", item.text));
      return article;
    }),
  );
}

function renderNotes(notes) {
  const list = document.querySelector("#noteList");
  if (!list) return;
  list.replaceChildren(
    ...notes.map((note) => {
      const link = createElement("a");
      link.href = note.url || "#";
      link.append(createElement("span", "", note.type), createElement("strong", "", note.title));
      return link;
    }),
  );
}

function renderResumeTimeline(resume) {
  const container = document.querySelector("#resumeTimeline");
  if (!container) return;
  const groups = [
    ["教育经历", resume.education || []],
    ["工作经历", resume.work || []],
  ];
  container.replaceChildren(
    ...groups.map(([title, items]) => {
      const group = createElement("div", "timeline-group");
      group.append(createElement("h3", "", title));
      items.forEach((item) => {
        const card = createElement("article", "timeline-item");
        card.append(
          createElement("span", "", item.time),
          createElement("h4", "", item.school || item.company || ""),
          createElement("strong", "", item.degree || item.role || ""),
          createElement("p", "", item.detail || ""),
        );
        group.append(card);
      });
      return group;
    }),
  );
}

function renderContacts(contacts) {
  const strip = document.querySelector("#contactStrip");
  if (!strip) return;
  strip.replaceChildren(
    ...contacts.map((contact) => {
      const link = createElement("a", contact.primary ? "primary-button small" : "", contact.label);
      link.href = contact.url || "#";
      if (contact.download) link.setAttribute("download", contact.download === true ? RESUME_DOWNLOAD_NAME : contact.download);
      return link;
    }),
  );
}

function renderProjectDetail() {
  const container = document.querySelector("#projectDetail");
  if (!container) return;
  const config = readConfig();
  renderAvatar(config);
  setText(".brand a span", config.brandName);
  const id = new URLSearchParams(window.location.search).get("id");
  const project = config.projects.find((item) => item.id === id) || config.projects[0];
  if (!project) {
    container.textContent = "暂无项目详情。";
    return;
  }
  container.replaceChildren();
  const heading = createElement("div", "section-heading detail-heading");
  heading.append(createElement("p", "eyebrow", project.type), createElement("h1", "", project.title), createElement("p", "", project.summary));
  container.append(heading);
  if (project.image) {
    const media = createElement("button", "detail-image-button");
    media.type = "button";
    media.dataset.image = project.image;
    const image = createElement("img");
    image.src = project.image;
    image.alt = project.title;
    media.append(image);
    container.append(media);
  }
  const card = createElement("article", "project-detail-card");
  card.append(createElement("h2", "", "项目详情"), createElement("p", "", project.detail || ""), createElement("h3", "", "关键要点"));
  const list = createElement("ul");
  (project.points || []).forEach((point) => list.append(createElement("li", "", point)));
  card.append(list);
  container.append(card);
}

function bindPublicInteractions() {
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll(".project-card").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.type !== filter;
      });
    });
  });
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => handlePrompt(button.dataset.prompt || ""));
  });
}

function addMessage(text, type) {
  const chatWindow = document.querySelector("#chatWindow");
  if (!chatWindow) return;
  const message = createElement("div", `message ${type}`, text);
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handlePrompt(text) {
  addMessage(text, "user");
  addMessage("这个入口已经预留。后续接入 Agent API 后，我会基于你的简历、AI 项目案例和产品方法论回答这个问题。", "assistant");
}

function bindAgentForm() {
  const chatForm = document.querySelector("#chatForm");
  const chatInput = document.querySelector("#chatInput");
  if (!chatForm || !chatInput) return;
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    handlePrompt(text);
    chatInput.value = "";
  });
}

function bindImageDialog() {
  const dialog = document.querySelector("#imageDialog");
  const image = document.querySelector("#imageDialogImg");
  if (!dialog || !image) return;
  document.addEventListener("click", (event) => {
    const avatar = event.target.closest("#avatarButton");
    const detailImage = event.target.closest("[data-image]");
    const src = avatar ? readConfig().avatar : detailImage?.dataset.image;
    if (!src) return;
    image.src = src;
    dialog.showModal();
  });
  document.querySelector("#closeImageDialog")?.addEventListener("click", () => dialog.close());
}

function bindCenterGate() {
  const dialog = document.querySelector("#passDialog");
  const passForm = document.querySelector("#passForm");
  const passInput = document.querySelector("#passInput");
  const hint = document.querySelector("#passHint");
  const openButtons = [document.querySelector("#openCenter"), document.querySelector("#heroCenterButton"), document.querySelector("#footerCenterButton")].filter(Boolean);
  if (!dialog || !passForm || !passInput) return;
  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      hint.textContent = "";
      passInput.value = "";
      dialog.showModal();
      passInput.focus();
    });
  });
  document.querySelector("#closePassDialog")?.addEventListener("click", () => dialog.close());
  passForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (passInput.value === CENTER_PASS) {
      localStorage.setItem(CENTER_AUTH_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
      dialog.close();
      window.open("./project-admin.html", "_blank", "noopener");
      return;
    }
    hint.textContent = "通行证不正确，请重新输入。";
  });
}

function bindMobileMenu() {
  const header = document.querySelector(".site-header");
  const button = document.querySelector("#mobileMenuButton");
  const menu = document.querySelector("#mobileHeaderMenu");
  if (!header || !button || !menu) return;

  const setOpen = (open) => {
    header.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  };

  button.addEventListener("click", () => {
    setOpen(!header.classList.contains("menu-open"));
  });

  menu.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function isCenterAuthed() {
  return Number(localStorage.getItem(CENTER_AUTH_KEY) || 0) > Date.now();
}

function bindCenterPage() {
  const centerApp = document.querySelector("#centerApp");
  if (!centerApp) return;
  if (!isCenterAuthed()) {
    centerApp.innerHTML = `
      <section class="admin-preview locked-panel">
        <p class="eyebrow">Locked</p>
        <h2>需要从展示页验证通行证</h2>
        <p>请返回展示页点击“个人中心”，输入通行证后再进入。</p>
        <a class="primary-button" href="./index.html">返回展示页</a>
      </section>
    `;
    return;
  }
  editorState = readConfig();
  loadCenterForms();
  renderAllEditors();
  bindCenterActions();
}

function loadCenterForms() {
  const siteForm = document.querySelector("#siteConfig");
  const projectForm = document.querySelector("#projectConfig");
  if (!siteForm || !projectForm || !editorState) return;
  renderAvatar(editorState);
  siteForm.elements.brandName.value = editorState.brandName;
  siteForm.elements.heroTitle.value = editorState.hero.title;
  siteForm.elements.heroSummary.value = editorState.hero.summary;
  siteForm.elements.heroPrimaryLabel.value = editorState.hero.primaryLabel;
  siteForm.elements.heroTags.value = arrayToLines(editorState.hero.tags);
  siteForm.elements.agentEyebrow.value = editorState.agent.eyebrow;
  siteForm.elements.agentTitle.value = editorState.agent.title;
  siteForm.elements.agentSummary.value = editorState.agent.summary;
  siteForm.elements.agentStatus.value = editorState.agent.status;
  siteForm.elements.agentWelcome.value = editorState.agent.welcome;
  siteForm.elements.agentPrompts.value = arrayToLines(editorState.agent.prompts);
  siteForm.elements.resumeSummary.value = editorState.resume.summary;
  siteForm.elements.resumeEyebrow.value = editorState.resume.eyebrow;
  siteForm.elements.resumeTitle.value = editorState.resume.title;
  projectForm.elements.projectsEyebrow.value = editorState.projectsSection.eyebrow;
  projectForm.elements.projectsTitle.value = editorState.projectsSection.title;
  projectForm.elements.projectsSummary.value = editorState.projectsSection.summary;
  projectForm.elements.capabilitiesEyebrow.value = editorState.capabilitiesSection.eyebrow;
  projectForm.elements.capabilitiesTitle.value = editorState.capabilitiesSection.title;
  projectForm.elements.capabilitiesSummary.value = editorState.capabilitiesSection.summary;
  projectForm.elements.thinkingEyebrow.value = editorState.thinking.eyebrow;
  projectForm.elements.thinkingTitle.value = editorState.thinking.title;
  projectForm.elements.thinkingSummary.value = editorState.thinking.summary;
}

function renderAllEditors() {
  renderContactsEditor();
  renderProjectsEditor();
  renderCapabilitiesEditor();
  renderNotesEditor();
  renderExperienceEditor("education");
  renderExperienceEditor("work");
}

function editorCard(title, removeHandler) {
  const card = createElement("article", "editor-card");
  const header = createElement("div", "editor-card-header");
  header.append(createElement("h4", "", title));
  const remove = createElement("button", "link-button danger-link", "删除");
  remove.type = "button";
  remove.addEventListener("click", removeHandler);
  header.append(remove);
  card.append(header);
  return card;
}

function field(labelText, value, onInput, tag = "input") {
  const label = createElement("label");
  label.append(document.createTextNode(labelText));
  const input = createElement(tag);
  input.value = value || "";
  input.addEventListener("input", () => onInput(input.value));
  label.append(input);
  return label;
}

function isResumeContact(item) {
  return !!item.download || item.label === "下载简历";
}

function ensureResumeContact() {
  let contact = editorState.contacts.find(isResumeContact);
  if (!contact) {
    contact = { label: "下载简历", url: RESUME_ASSET_PATH, primary: true, download: RESUME_DOWNLOAD_NAME };
    editorState.contacts.push(contact);
  }
  contact.download = contact.download === true ? RESUME_DOWNLOAD_NAME : contact.download || RESUME_DOWNLOAD_NAME;
  return contact;
}

function renderContactsEditor() {
  const box = document.querySelector("#contactsEditor");
  if (!box) return;
  box.replaceChildren(
    ...editorState.contacts.map((item, index) => {
      const card = editorCard(`联系项 ${index + 1}`, () => {
        editorState.contacts.splice(index, 1);
        renderContactsEditor();
      });
      card.append(field("名称", item.label, (value) => (item.label = value)));
      if (isResumeContact(item)) {
        const upload = createElement("label");
        upload.append(document.createTextNode("简历 PDF 文件"));
        const input = createElement("input");
        input.type = "file";
        input.accept = "application/pdf,.pdf";
        input.addEventListener("change", async () => {
          const file = input.files[0];
          if (!file) return;
          pendingResumeFile = {
            name: file.name || RESUME_DOWNLOAD_NAME,
            type: file.type || "application/pdf",
            dataUrl: await fileToDataUrl(file),
          };
          item.url = pendingResumeFile.dataUrl;
          item.download = pendingResumeFile.name;
          renderContactsEditor();
        });
        upload.append(input);
        card.append(upload);
        const currentFile = createElement("p", "editor-muted", pendingResumeFile?.name || item.download || "当前线上文件：assets/resume.pdf");
        card.append(currentFile);
      } else {
        card.append(field("链接", item.url, (value) => (item.url = value)));
      }
      return card;
    }),
  );
}

function renderProjectsEditor() {
  const box = document.querySelector("#projectsEditor");
  if (!box) return;
  box.replaceChildren(
    ...editorState.projects.map((item, index) => {
      const card = editorCard(`项目 ${index + 1}`, () => {
        editorState.projects.splice(index, 1);
        renderProjectsEditor();
      });
      card.append(
        field("项目类型", item.type, (value) => (item.type = value)),
        field("筛选标识", item.filter, (value) => (item.filter = value)),
        field("项目标题", item.title, (value) => (item.title = value)),
        field("项目简介", item.summary, (value) => (item.summary = value), "textarea"),
        field("项目要点，每行一个", arrayToLines(item.points), (value) => (item.points = linesToArray(value)), "textarea"),
        field("项目详情正文", item.detail, (value) => (item.detail = value), "textarea"),
      );
      const upload = createElement("label");
      upload.append(document.createTextNode("项目插图"));
      const input = createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.addEventListener("change", async () => {
        if (input.files[0]) item.image = await fileToDataUrl(input.files[0]);
        renderProjectsEditor();
      });
      upload.append(input);
      card.append(upload);
      if (item.image) {
        const preview = createElement("img", "editor-image-preview");
        preview.src = item.image;
        card.append(preview);
        const clearImage = createElement("button", "secondary-button small", "清除项目图片");
        clearImage.type = "button";
        clearImage.addEventListener("click", () => {
          item.image = "";
          renderProjectsEditor();
        });
        card.append(clearImage);
      }
      return card;
    }),
  );
}

function renderCapabilitiesEditor() {
  const box = document.querySelector("#capabilitiesEditor");
  if (!box) return;
  box.replaceChildren(
    ...editorState.capabilities.map((item, index) => {
      const card = editorCard(`能力 ${index + 1}`, () => {
        editorState.capabilities.splice(index, 1);
        renderCapabilitiesEditor();
      });
      card.append(field("能力名称", item.title, (value) => (item.title = value)), field("能力说明", item.text, (value) => (item.text = value), "textarea"));
      return card;
    }),
  );
}

function renderNotesEditor() {
  const box = document.querySelector("#notesEditor");
  if (!box) return;
  box.replaceChildren(
    ...editorState.thinking.notes.map((item, index) => {
      const card = editorCard(`文章 ${index + 1}`, () => {
        editorState.thinking.notes.splice(index, 1);
        renderNotesEditor();
      });
      card.append(field("类型", item.type, (value) => (item.type = value)), field("标题", item.title, (value) => (item.title = value)), field("链接", item.url, (value) => (item.url = value)));
      return card;
    }),
  );
}

function renderExperienceEditor(kind) {
  const box = document.querySelector(`#${kind}Editor`);
  const list = editorState.resume[kind];
  if (!box || !list) return;
  box.replaceChildren(
    ...list.map((item, index) => {
      const card = editorCard(`${kind === "education" ? "教育" : "工作"} ${index + 1}`, () => {
        list.splice(index, 1);
        renderExperienceEditor(kind);
      });
      card.append(
        field(kind === "education" ? "学校" : "公司", item.school || item.company, (value) => {
          if (kind === "education") item.school = value;
          else item.company = value;
        }),
        field(kind === "education" ? "学历/专业" : "职位", item.degree || item.role, (value) => {
          if (kind === "education") item.degree = value;
          else item.role = value;
        }),
        field("时间", item.time, (value) => (item.time = value)),
        field("说明", item.detail, (value) => (item.detail = value), "textarea"),
      );
      return card;
    }),
  );
}

function collectCenterConfig() {
  const siteForm = document.querySelector("#siteConfig");
  const projectForm = document.querySelector("#projectConfig");
  editorState.brandName = siteForm.elements.brandName.value.trim();
  editorState.hero.title = siteForm.elements.heroTitle.value.trim();
  editorState.hero.summary = siteForm.elements.heroSummary.value.trim();
  editorState.hero.primaryLabel = siteForm.elements.heroPrimaryLabel.value.trim();
  editorState.hero.tags = linesToArray(siteForm.elements.heroTags.value);
  editorState.agent.eyebrow = siteForm.elements.agentEyebrow.value.trim();
  editorState.agent.title = siteForm.elements.agentTitle.value.trim();
  editorState.agent.summary = siteForm.elements.agentSummary.value.trim();
  editorState.agent.status = siteForm.elements.agentStatus.value.trim();
  editorState.agent.welcome = siteForm.elements.agentWelcome.value.trim();
  editorState.agent.prompts = linesToArray(siteForm.elements.agentPrompts.value);
  editorState.resume.summary = siteForm.elements.resumeSummary.value.trim();
  editorState.resume.eyebrow = siteForm.elements.resumeEyebrow.value.trim();
  editorState.resume.title = siteForm.elements.resumeTitle.value.trim();
  const resumeContact = ensureResumeContact();
  if (pendingResumeFile) {
    resumeContact.url = RESUME_ASSET_PATH;
    resumeContact.download = pendingResumeFile.name || RESUME_DOWNLOAD_NAME;
  }
  editorState.projectsSection.eyebrow = projectForm.elements.projectsEyebrow.value.trim();
  editorState.projectsSection.title = projectForm.elements.projectsTitle.value.trim();
  editorState.projectsSection.summary = projectForm.elements.projectsSummary.value.trim();
  editorState.capabilitiesSection.eyebrow = projectForm.elements.capabilitiesEyebrow.value.trim();
  editorState.capabilitiesSection.title = projectForm.elements.capabilitiesTitle.value.trim();
  editorState.capabilitiesSection.summary = projectForm.elements.capabilitiesSummary.value.trim();
  editorState.thinking.eyebrow = projectForm.elements.thinkingEyebrow.value.trim();
  editorState.thinking.title = projectForm.elements.thinkingTitle.value.trim();
  editorState.thinking.summary = projectForm.elements.thinkingSummary.value.trim();
  return normalizeConfig(editorState);
}

function bindCenterActions() {
  const hint = document.querySelector("#configHint");
  const publishEndpoint = document.querySelector("#publishEndpoint");
  const publishSecret = document.querySelector("#publishSecret");
  if (publishEndpoint) {
    publishEndpoint.value = resolvePublishEndpoint();
    publishEndpoint.addEventListener("input", () => {
      localStorage.setItem(PUBLISH_ENDPOINT_KEY, publishEndpoint.value.trim());
    });
  }
  if (publishSecret) {
    publishSecret.value = localStorage.getItem(PUBLISH_SECRET_KEY) || "";
    publishSecret.addEventListener("input", () => {
      localStorage.setItem(PUBLISH_SECRET_KEY, publishSecret.value.trim());
    });
  }
  document.querySelector("[name='avatarFile']")?.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const dataUrl = await cropAvatarToSquare(file);
      pendingAvatarFile = {
        name: "avatar.png",
        type: "image/png",
        dataUrl,
      };
      avatarShouldClear = false;
      editorState.avatar = dataUrl;
      renderAvatar(editorState);
      hint.textContent = "头像已载入，点击保存并发布后其他人就能看到。";
    }
  });
  document.querySelector("#clearAvatar")?.addEventListener("click", () => {
    pendingAvatarFile = null;
    avatarShouldClear = true;
    editorState.avatar = "";
    renderAvatar(editorState);
    hint.textContent = "头像已清除，点击保存并发布后线上头像会被清除。";
  });
  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.add;
      if (type === "contacts") editorState.contacts.push({ label: "新联系项", url: "#", primary: false });
      if (type === "projects") editorState.projects.push({ id: `project-${Date.now()}`, type: "AI 产品", filter: "ai", title: "新项目", summary: "项目简介", image: "", points: ["关键要点"], detail: "项目详情正文" });
      if (type === "capabilities") editorState.capabilities.push({ title: "新能力", text: "能力说明" });
      if (type === "notes") editorState.thinking.notes.push({ type: "类型", title: "文章标题", url: "#" });
      if (type === "education") editorState.resume.education.push({ school: "学校名称", degree: "学历/专业", time: "时间", detail: "说明" });
      if (type === "work") editorState.resume.work.push({ company: "公司名称", role: "职位", time: "时间", detail: "说明" });
      renderAllEditors();
    });
  });
  document.querySelector("#localSaveConfig")?.addEventListener("click", () => {
    const saved = saveConfig(collectCenterConfig());
    hint.textContent = saved
      ? "已保存到当前浏览器，可本机预览，但其他人暂时看不到。"
      : "本机存储空间不足。请使用主保存按钮发布到 GitHub，或压缩图片后再试。";
  });
  document.querySelector("#exportConfig")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(JSON.stringify(collectCenterConfig(), null, 2));
    hint.textContent = "site-config.json 内容已复制。请到 GitHub 替换同名文件并提交。";
  });
  document.querySelector("#downloadConfig")?.addEventListener("click", () => {
    downloadTextFile("site-config.json", JSON.stringify(collectCenterConfig(), null, 2));
    hint.textContent = "site-config.json 已下载。请上传或替换到 GitHub 仓库根目录。";
  });
  document.querySelector("#publishConfig")?.addEventListener("click", async () => {
    const endpoint = publishEndpoint?.value.trim();
    const secret = publishSecret?.value.trim();
    if (!endpoint) {
      hint.textContent = "缺少发布接口，请联系我检查配置。";
      return;
    }
    if (!secret) {
      hint.textContent = "首次发布需要填写发布密钥。填写后会记住在当前浏览器里。";
      return;
    }
    localStorage.setItem(PUBLISH_ENDPOINT_KEY, endpoint);
    localStorage.setItem(PUBLISH_SECRET_KEY, secret);
    const button = document.querySelector("#publishConfig");
    button.disabled = true;
    hint.textContent = "正在发布到 GitHub...";
    try {
      const config = collectCenterConfig();
      const result = await publishToGithub(config, endpoint, secret, {
        resumeFile: pendingResumeFile,
        avatarFile: pendingAvatarFile,
        clearAvatar: avatarShouldClear,
      });
      if (result.config) {
        editorState = normalizeConfig(result.config);
        saveConfig(editorState);
        renderAvatar(editorState);
      } else {
        saveConfig(config);
      }
      pendingResumeFile = null;
      pendingAvatarFile = null;
      avatarShouldClear = false;
      hint.innerHTML = result.commit
        ? `已发布到 GitHub。GitHub Pages 稍后会更新：<a href="${result.commit}" target="_blank" rel="noopener">查看提交</a>`
        : "已发布到 GitHub。GitHub Pages 稍后会更新。";
    } catch (error) {
      hint.textContent = error.message === "Failed to fetch"
        ? "发布接口连接失败。请刷新页面后重试，或展开高级设置检查 Worker 地址。"
        : error.message || "发布失败，请检查 Worker 地址、发布密钥和 GitHub Token。";
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector("#resetConfig")?.addEventListener("click", () => {
    editorState = clone(defaultConfig);
    saveConfig(editorState);
    loadCenterForms();
    renderAllEditors();
    hint.textContent = "已恢复默认内容。";
  });
  document.querySelector("#logoutCenter")?.addEventListener("click", () => {
    localStorage.removeItem(CENTER_AUTH_KEY);
    window.location.href = "./index.html";
  });
}

async function init() {
  await loadRepositoryConfig();
  renderPublicSite();
  renderProjectDetail();
  bindAgentForm();
  bindImageDialog();
  bindMobileMenu();
  bindCenterGate();
  bindCenterPage();
}

init();
