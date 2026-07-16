const CENTER_PASS = "6540064aa";
const CONFIG_KEY = "portfolioConfig";
const CENTER_AUTH_KEY = "portfolioCenterAuthedUntil";
const PUBLISH_ENDPOINT_KEY = "portfolioPublishEndpoint";
const PUBLISH_SECRET_KEY = "portfolioPublishSecret";
const DEFAULT_PUBLISH_ENDPOINT = "https://ai-pm-portfolio-publisher.vercel.app/api/publish";
const LEGACY_PUBLISH_ENDPOINTS = ["https://ai-pm-portfolio-publisher.lilibin-ai-pm.workers.dev"];
const RESUME_ASSET_PATH = "./assets/resume.pdf";
const RESUME_DOWNLOAD_NAME = "李丽斌-UI_UX简历.pdf";
const CONFIG_VERSION = 5;
const CONFIG_URL = "./site-config.json";
let pendingResumeFile = null;
let pendingAvatarFile = null;
let avatarShouldClear = false;

function resolvePublishEndpoint() {
  const stored = (localStorage.getItem(PUBLISH_ENDPOINT_KEY) || "").trim().replace(/\/$/, "");
  try {
    const url = new URL(stored);
    if (url.protocol === "https:" && !LEGACY_PUBLISH_ENDPOINTS.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // Ignore stale local values from earlier setup attempts.
  }
  localStorage.setItem(PUBLISH_ENDPOINT_KEY, DEFAULT_PUBLISH_ENDPOINT);
  return DEFAULT_PUBLISH_ENDPOINT;
}

const defaultConfig = {
  "version": 5,
  "brandName": "李丽斌 - UI/UX 设计师简历",
  "avatar": "./assets/avatar.png?v=1783263742204",
  "hero": {
    "title": "用用户研究、交互设计和视觉落地，打造更好用的数字体验。",
    "summary": "10 年 UI/UX 设计经验，长期服务教育数字化、智慧农业、政企平台、停车服务与内部效率工具等项目。擅长从用户调研、需求拆解、信息架构、交互原型、视觉规范到上线走查的全链路设计落地。",
    "primaryLabel": "查看 UI/UX 项目",
    "tags": [
      "UI/UX 设计师",
      "B 端体验设计",
      "用户研究",
      "设计规范"
    ]
  },
  "agent": {
    "eyebrow": "Portfolio Assistant",
    "title": "让面试官快速了解我的 UI/UX 设计经验",
    "summary": "这里预留作品集问答入口。后续可以接入智能助手，让面试官围绕用户研究、交互设计、视觉规范、项目落地和设计复盘进行问答。",
    "status": "UI/UX 作品集助手 · 待接入",
    "welcome": "你好，我是预留的 UI/UX 作品集助手。你可以问我：最有代表性的设计项目是什么、如何做用户调研、如何保障设计落地。",
    "prompts": [
      "你最有代表性的 UI/UX 项目是什么？",
      "你如何从调研中发现用户痛点？",
      "你如何搭建设计规范和组件库？",
      "你为什么适合 UI/UX 设计师岗位？"
    ]
  },
  "projectsSection": {
    "eyebrow": "UI/UX Case Studies",
    "title": "UI/UX 项目经验",
    "summary": "围绕教育数字化、智慧农业、政企平台、停车服务等项目，展示从用户调研、需求拆解、交互原型、视觉规范到上线走查的完整设计链路。"
  },
  "projects": [
    {
      "id": "ai-class-assistant",
      "type": "AI 教育设计",
      "filter": "ai-design",
      "title": "AI 班助",
      "summary": "面向中小学班级管理与师生协作场景的 AI 班助工具，提升班级运营、学情跟踪与教学反馈效率。",
      "image": "",
      "points": [
        "协同业务与需求负责人完成教师、学生、家长用户调研与教育场景需求梳理",
        "独立完成竞品分析、用户体验地图搭建与体验流程设计参与",
        "主导全流程 UI 视觉设计，并负责上线前设计走查与落地验收"
      ],
      "detail": "依托教育数字化转型背景，参与打造适配班级运营、学情跟踪、师生互动全场景的 AI 班助工具。负责与业务与需求负责人协作开展教师、学生、家长侧用户调研，梳理班级管理与学习协作中的核心痛点，独立完成竞品分析和用户体验地图搭建，深度参与体验流程设计。主导项目全流程 UI 视觉设计，输出贴合教育行业属性与用户使用习惯的设计方案，并在上线前完成设计走查和落地验收，保障设计方案精准落地。"
    },
    {
      "id": "waypoint-marking",
      "type": "无人机 / 应急",
      "filter": "mobile",
      "title": "航点标记",
      "summary": "与大疆合作，围绕应急场景信号保障需求，完成无人机航线记录与航点管理功能设计。",
      "image": "",
      "points": [
        "担任航点航线管理模块 UX/UI 设计核心负责人",
        "面向无人机飞手开展需求调研，结合实战流程优化交互原型",
        "完成竞品分析、视觉设计、内部评审迭代与开发交付物输出"
      ],
      "detail": "项目围绕应急场景信号保障需求，与大疆合作打造配套系统，支持无人机实战和演练中的航线记录、航点管理等作业流程。担任项目 UX/UI 设计核心负责人，负责航点航线管理模块的交互设计与视觉界面设计；针对无人机飞手核心用户开展深度需求调研与场景沟通，结合实际作业流程优化原型，提升界面实操性；通过竞品分析与设计趋势研究，融合应急行业属性完成界面设计，经多轮内部评审打磨后输出符合开发标准的设计交付物。"
    },
    {
      "id": "gufengdeng-uiux",
      "type": "智慧农业",
      "filter": "b2b",
      "title": "中移谷丰登",
      "summary": "面向农业生产与产销全链路的数字化系统，通过 UI/UX 设计提升农业运营效率。",
      "image": "",
      "points": [
        "协同业务与需求负责人开展农业行业用户调研与需求梳理",
        "独立完成竞品分析、用户体验地图搭建与体验流程设计参与",
        "主导项目全流程 UI 视觉设计，保障农业场景下的设计落地"
      ],
      "detail": "依托国家农业扶持政策与农业数字化发展需求，参与打造适配农业生产、产销全链路的数字化系统。与业务与需求负责人协作开展农业行业用户调研和需求梳理，深度参与体验流程设计，独立完成竞品分析、用户体验地图搭建等工作，挖掘农业行业用户的核心需求与使用痛点。主导项目全流程 UI 视觉设计，输出贴合农业行业属性与用户使用习惯的设计方案，并负责上线前设计走查和落地验收，为项目适配农业实际使用场景提供设计支撑。"
    },
    {
      "id": "smart-parking-system",
      "type": "B 端系统",
      "filter": "b2b",
      "title": "智慧停车系统",
      "summary": "覆盖停车云平台、物业管理、门岗管理与微信公众号的全链路停车数字化系统体系。",
      "image": "",
      "points": [
        "主导四大终端 UX/UI 全流程设计，兼顾 B 端管理与 C 端车主体验",
        "针对管理端、门岗端、移动端建立差异化视觉体系与交互逻辑",
        "搭建设计规范与组件库，持续迭代提升系统易用性和一致性"
      ],
      "detail": "项目面向停车领域数字化升级，覆盖停车系统管理云平台、物业管理系统、门岗管理系统及微信公众号四大终端。作为 UX/UI 设计师，主导并协同团队完成四大终端的全流程设计工作，基于 B 端管理人员、门岗执勤人员、C 端车主等不同用户群体的使用场景与核心需求，搭建差异化视觉体系与交互逻辑：管理端强调专业高效，门岗端强调清晰醒目与操作便捷，C 端服务载体强调轻量直观。通过常态化反馈机制持续优化界面视觉和交互逻辑，并搭建设计规范与组件库，保障多终端一致性。"
    },
    {
      "id": "customer-service-management",
      "type": "内部效率工具",
      "filter": "b2b",
      "title": "客服管理系统",
      "summary": "面向内部售后服务与跨岗位协作的客服管理系统，规范事项流转并提升办公效率。",
      "image": "",
      "points": [
        "主导内部客服管理系统 UX/UI 全流程设计",
        "围绕事项上报、指派、认领、处理、审核、归档梳理标准化工作流",
        "上线后收集内部反馈并输出迭代优化方案"
      ],
      "detail": "该系统定位为公司内部售后服务管理平台，聚焦内部员工高效办公场景，以便捷、高效、易用为设计目标。主导系统 UX/UI 全流程设计，围绕事项上报、指派、认领、处理、审核、归档等环节梳理标准化工作流，帮助售后相关事项以订单化形式规范流转。结合内部办公场景特性和用户使用习惯，确立简约轻快的整体设计风格，严格控制操作层级，融入微交互设计细节，降低用户学习成本。系统上线后，持续收集内部使用反馈并进行问题复盘，为后续迭代提供设计支撑。"
    },
    {
      "id": "guangming-education-cloud",
      "type": "教育平台",
      "filter": "education",
      "title": "光明新区智慧教育云平台",
      "summary": "面向教育政企单位的综合性教育数字化平台，覆盖公文互通、质量监测与学术交流。",
      "image": "",
      "points": [
        "主导平台 Web 端 UX/UI 全流程设计，参与需求评审并提出体验优化建议",
        "搭建统一视觉体系、设计规范和组件库，保障多模块一致性",
        "完成设计稿、标注、切图交付，并负责上线前后界面优化"
      ],
      "detail": "项目聚焦教育领域数字化升级，打造集公文互通、质量监测、学术交流于一体的综合性教育云平台。作为 UX/UI 设计师，主导平台 Web 端全流程设计，协同业务与需求负责人梳理业务需求、参与需求评审，并从用户体验和设计落地角度提出优化建议。结合 40 岁左右教师及教育从业者的操作习惯和审美偏好，确定中绿色主色调，采用左导航、顶部功能模块、右下内容区的常规后台布局，降低学习成本。牵头搭建设计规范与组件库，完成设计稿、标注、切图交付，并负责上线前后的界面优化与框架调整。"
    },
    {
      "id": "pengshan-party-building",
      "type": "政务服务",
      "filter": "government",
      "title": "彭山 E 支部党建之家",
      "summary": "面向支部、党员、群众三类角色的党建服务系统，支持组织活动、在线学习与意见反馈。",
      "image": "",
      "points": [
        "主导党建服务系统 UX/UI 全流程设计，覆盖需求评审、原型、高保真与交付",
        "围绕支部、党员、群众三类角色梳理业务逻辑与操作流程",
        "以党政红和规范化控件体系强化行业属性与使用效率"
      ],
      "detail": "项目面向党建服务数字化升级，覆盖支部、党员、群众三类角色，支持组织关系管理、组织生活、学习教育、评优评先、意见反馈等核心场景。作为 UX/UI 设计师，深度参与需求评审，从用户体验、设计落地和行业合规维度提出优化建议；主导绘制全流程低保真原型，梳理各角色业务逻辑与操作路径；结合党政领域庄重规范的行业调性，以党政红为主色调，完成全页面高保真设计、标注和切图交付，并配合开发解决落地过程中的适配问题。"
    },
    {
      "id": "school-resource-platform",
      "type": "教育平台",
      "filter": "education",
      "title": "校本资源平台",
      "summary": "面向学校教学资源管理与教师教学辅助场景，覆盖后台管理与前端展示两大模块。",
      "image": "",
      "points": [
        "主导校本资源平台后台管理和前端展示的 UI 设计",
        "围绕教师群体操作习惯确定蓝色主色调与常规后台布局",
        "规范控件、表格和页面视觉语言，提升资源管理效率与可读性"
      ],
      "detail": "项目聚焦教育领域校本资源数字化管理需求，覆盖学校资源管理、教学辅助、数据统计等场景，分为后台管理系统与前端展示两大模块。作为 UI 设计师，主导校本资源平台全流程 UI 设计，结合 40 岁左右教师群体的操作习惯与审美偏好，确定蓝色主色调，传递教育领域严谨、专业的界面感受；通过留白装饰、实体按钮、斑马线表格、左导航加顶部功能区的后台布局，提升数据可读性和操作流畅度，并保障后台与前台视觉语言一致。"
    }
  ],
  "capabilitiesSection": {
    "eyebrow": "UI/UX Skill Map",
    "title": "UI/UX 设计能力结构",
    "summary": "把设计能力拆成可被面试官判断的具体行为：从用户研究、信息架构、交互原型到视觉规范、设计交付和体验迭代。"
  },
  "capabilities": [
    {
      "title": "用户研究与需求拆解",
      "text": "能围绕教师、学生、物业管理、门岗、政企人员等不同角色开展调研，识别真实使用场景、核心痛点和设计机会点。"
    },
    {
      "title": "信息架构与交互设计",
      "text": "擅长梳理复杂 B 端业务流程，搭建清晰的信息层级、任务路径和低保真原型，降低用户学习成本与操作成本。"
    },
    {
      "title": "视觉设计与设计规范",
      "text": "熟悉 Web、App、小程序等多端设计，能结合教育、政务、农业、停车等行业调性建立统一视觉体系、组件规范和页面标准。"
    },
    {
      "title": "落地走查与体验迭代",
      "text": "具备设计交付、标注切图、开发协作、上线前走查和落地验收经验，能基于反馈持续优化系统易用性与一致性。"
    }
  ],
  "thinking": {
    "eyebrow": "UX Design Notes",
    "title": "UI/UX 设计思考",
    "summary": "放置设计方法论、项目复盘和体验拆解，展示从用户问题到设计策略、再到落地验证的完整思考过程。",
    "notes": [
      {
        "type": "用户研究",
        "title": "我如何从业务调研中识别真正的用户痛点",
        "url": "#"
      },
      {
        "type": "交互设计",
        "title": "复杂 B 端系统如何降低操作层级和学习成本",
        "url": "#"
      },
      {
        "type": "设计规范",
        "title": "多端界面如何建立统一但不僵硬的视觉语言",
        "url": "#"
      },
      {
        "type": "体验复盘",
        "title": "上线前设计走查如何保障设计方案 1:1 落地",
        "url": "#"
      }
    ]
  },
  "resume": {
    "eyebrow": "Resume",
    "title": "教育与工作经历",
    "summary": "10 年 UI/UX 设计经验，覆盖教育数字化、智慧农业、政企平台、停车服务、内部效率工具等项目，具备用户调研、信息架构、交互原型、视觉设计、设计规范与落地走查全链路能力。",
    "education": [
      {
        "school": "四川师范大学",
        "degree": "通信工程 · 本科",
        "time": "2012 - 2016",
        "detail": "通信工程专业背景，具备技术理解和跨职能沟通基础。"
      }
    ],
    "work": [
      {
        "company": "新讯数字科技（杭州）有限公司成都分公司",
        "role": "高级 UX 设计师",
        "time": "2019.11 - 2026.01",
        "detail": "负责 AI 班助、智慧校园、中移谷丰登、智慧养猪、智慧农机、航点标记、智慧乡村、乡村振兴、视频监控、中移凌云等项目的 UI/UX 全流程设计，为 Web、App、小程序等多端界面提供用户调研、需求分析、交互设计、视觉规范、设计走查与落地验收支持。"
      },
      {
        "company": "中软国际（中国）科技有限公司",
        "role": "UX / 交互设计师",
        "time": "2018.11 - 2019.03",
        "detail": "负责元件管理系统 UI/UX 全流程设计，为系统提供 Web 端设计支撑，围绕元件出入库、元件增删改查、电路图模板搭建等 B 端专业场景输出交互方案、视觉规范和上线交付物，推动元件管理与电路设计相关 B 端体验升级。"
      },
      {
        "company": "四川驿停车智慧科技有限公司",
        "role": "UI 设计师",
        "time": "2018.04 - 2018.10",
        "detail": "负责 B 端停车管理系统及客服服务系统的 UI/UX 全流程设计，为停车云平台、物业管理、门岗管理、微信公众号及内部客服系统提供 Web 与移动端设计支撑，推动办公、服务与停车业务数字化体验升级。"
      },
      {
        "company": "软通动力信息技术（集团）股份有限公司",
        "role": "UX / 交互设计师",
        "time": "2016.06 - 2018.03",
        "detail": "负责教育数字化、党建、企业 IM、物联网等多赛道项目 UI/UX 设计，核心项目包含光明新区教育基础云平台、彭山 E 支部党建之家、坪山区教育云基础软件平台、电子书包、校本资源平台、内部交流 BBS、软通 IM、长虹 IM 及易感物联网等。"
      }
    ]
  },
  "contacts": [
    {
      "label": "15708464600",
      "url": "tel:15708464600"
    },
    {
      "label": "15708464600@163.com",
      "url": "mailto:15708464600@163.com"
    },
    {
      "label": "下载简历",
      "url": "./assets/resume.pdf",
      "primary": true,
      "download": "李丽斌-UI_UX简历.pdf"
    }
  ]
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
  addMessage("这个入口已经预留。后续接入智能助手后，我会基于你的简历、UI/UX 项目案例和设计方法论回答这个问题。", "assistant");
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
    publishSecret.value = localStorage.getItem(PUBLISH_SECRET_KEY) || CENTER_PASS;
    localStorage.setItem(PUBLISH_SECRET_KEY, publishSecret.value.trim());
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
      if (type === "projects") editorState.projects.push({ id: `project-${Date.now()}`, type: "UI/UX 项目", filter: "uiux", title: "新项目", summary: "项目简介", image: "", points: ["关键要点"], detail: "项目详情正文" });
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
