import { defineConfig } from "vitepress";
import typedocSidebar from "../api/typedoc-sidebar.json";

function normalizeBasePath(input: string | undefined): string {
  const value = input?.trim().replace(/^\/+|\/+$/g, "") ?? "";
  if (!value) return "/";
  return `/${value}/`;
}

const base = normalizeBasePath(process.env.DOCS_BASE);
const repositoryUrl = process.env.DOCS_REPOSITORY_URL?.trim().replace(/\/+$/, "") ?? "";
const repositoryBranch = process.env.DOCS_REPOSITORY_BRANCH?.trim() || "main";
const sourceRepositoryUrl = process.env.DOCS_SOURCE_REPOSITORY_URL?.trim().replace(/\/+$/, "")
  || "https://github.com/bsv8/KeymasterConnect";
const sourceBranch = process.env.DOCS_SOURCE_REPOSITORY_BRANCH?.trim() || "main";
const sourceUrl = `${sourceRepositoryUrl}/tree/${encodeURIComponent(sourceBranch)}/src`;
// dev 反代经 Tailnet 域名访问时放行 Vite host 检查；默认只允许本地，生产构建不受影响。
const extraAllowedHosts = (process.env.CONNECT_DOCS_ALLOWED_HOSTS ?? "")
  .split(",")
  .map(host => host.trim())
  .filter(host => host.length > 0);

const apiReference = [{ text: "API 字段参考", items: typedocSidebar }];

export default defineConfig({
  lang: "zh-CN",
  title: "Keymaster Connect",
  description: "面向浏览器 App 的类型安全身份、密码学、消息、存储和支付能力。",
  base,
  appearance: "dark",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/keymaster-mark.svg" }],
    ["meta", { name: "theme-color", content: "#07110f" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Keymaster Connect SDK" }],
    ["meta", { property: "og:description", content: "浏览器 App 请求能力，但永远不接触私钥。" }],
    // 记录手动语言选择，供根路径跳转页优先使用。
    ["script", {}, "try{var m=location.pathname.match(/^\\/(zh|en|ja)(\\/|$)/);if(m)localStorage.setItem('connect-docs-lang',m[1]);}catch(e){}"],
  ],
  locales: {
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh/",
      title: "Keymaster Connect",
      description: "面向浏览器 App 的类型安全身份、密码学、消息、存储和支付能力。",
      themeConfig: {
        nav: [
          { text: "指南", link: "/zh/guide/getting-started" },
          { text: "概念", link: "/zh/concepts/sessions" },
          { text: "API", link: "/api/" },
        ],
        sidebar: {
          "/zh/guide/": [
            {
              text: "指南",
              items: [
                { text: "快速开始", link: "/zh/guide/getting-started" },
                { text: "调用能力", link: "/zh/guide/capabilities" },
                { text: "钱包接收端", link: "/zh/guide/receiver" },
                { text: "接收事件", link: "/zh/guide/events" },
                { text: "错误与取消", link: "/zh/guide/errors" }
              ]
            }
          ],
          "/zh/concepts/": [
            {
              text: "概念",
              items: [
                { text: "会话", link: "/zh/concepts/sessions" },
                { text: "Popup 模式", link: "/zh/concepts/popup-mode" },
                { text: "appView mode", link: "/zh/concepts/appview-mode" },
                { text: "二进制数据", link: "/zh/concepts/binary-data" },
                { text: "AI 工具", link: "/zh/concepts/ai-tools" },
                { text: "安全模型", link: "/zh/concepts/security" }
              ]
            }
          ],
        },
        outline: { level: [2, 3], label: "本页内容" },
        docFooter: { prev: "上一页", next: "下一页" },
        langMenuLabel: "简体中文",
        returnToTop: "回到顶部",
        sidebarMenuLabel: "目录",
        darkModeSwitchLabel: "外观",
        footer: {
          message: "使用能力，不托管私钥。",
          copyright: "Keymaster Connect"
        }
      }
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      title: "Keymaster Connect",
      description: "Type-safe identity, cryptography, messaging, storage and payment capabilities for browser apps.",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/en/guide/getting-started" },
          { text: "Concepts", link: "/en/concepts/sessions" },
          { text: "API", link: "/api/" },
        ],
        sidebar: {
          "/en/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Getting started", link: "/en/guide/getting-started" },
                { text: "Capabilities", link: "/en/guide/capabilities" },
                { text: "Wallet receiver", link: "/en/guide/receiver" },
                { text: "Events", link: "/en/guide/events" },
                { text: "Errors & cancellation", link: "/en/guide/errors" }
              ]
            }
          ],
          "/en/concepts/": [
            {
              text: "Concepts",
              items: [
                { text: "Sessions", link: "/en/concepts/sessions" },
                { text: "Popup mode", link: "/en/concepts/popup-mode" },
                { text: "appView mode", link: "/en/concepts/appview-mode" },
                { text: "Binary data", link: "/en/concepts/binary-data" },
                { text: "AI tools", link: "/en/concepts/ai-tools" },
                { text: "Security model", link: "/en/concepts/security" }
              ]
            }
          ],
        },
        outline: { level: [2, 3], label: "On this page" },
        docFooter: { prev: "Previous", next: "Next" },
        langMenuLabel: "English",
        returnToTop: "Back to top",
        sidebarMenuLabel: "Menu",
        darkModeSwitchLabel: "Appearance",
        footer: {
          message: "Use capabilities, never host private keys.",
          copyright: "Keymaster Connect"
        }
      }
    },
    ja: {
      label: "日本語",
      lang: "ja-JP",
      link: "/ja/",
      title: "Keymaster Connect",
      description: "ブラウザアプリ向け型安全な身份・暗号・メッセージ・保存・支払機能。",
      themeConfig: {
        nav: [
          { text: "指南", link: "/ja/guide/getting-started" },
          { text: "概念", link: "/ja/concepts/sessions" },
          { text: "API", link: "/api/" },
        ],
        sidebar: {
          "/ja/guide/": [
            {
              text: "指南",
              items: [
                { text: "はじめに", link: "/ja/guide/getting-started" },
                { text: "機能一覧", link: "/ja/guide/capabilities" },
                { text: "ウォレット受信端", link: "/ja/guide/receiver" },
                { text: "イベント受信", link: "/ja/guide/events" },
                { text: "錯誤とキャンセル", link: "/ja/guide/errors" }
              ]
            }
          ],
          "/ja/concepts/": [
            {
              text: "概念",
              items: [
                { text: "セッション", link: "/ja/concepts/sessions" },
                { text: "Popup モード", link: "/ja/concepts/popup-mode" },
                { text: "appView モード", link: "/ja/concepts/appview-mode" },
                { text: "バイナリデータ", link: "/ja/concepts/binary-data" },
                { text: "AI 道具", link: "/ja/concepts/ai-tools" },
                { text: "安全模型", link: "/ja/concepts/security" }
              ]
            }
          ],
        },
        outline: { level: [2, 3], label: "この頁の内容" },
        docFooter: { prev: "前頁", next: "次頁" },
        langMenuLabel: "日本語",
        returnToTop: "頂部に戻る",
        sidebarMenuLabel: "目次",
        darkModeSwitchLabel: "外観",
        footer: {
          message: "能力を利用し、秘密鍵を托管しない。",
          copyright: "Keymaster Connect"
        }
      }
    }
  },
  themeConfig: {
    logo: { src: "/keymaster-mark.svg", alt: "Keymaster Connect" },
    siteTitle: "Connect",
    nav: [
      { text: "指南", link: "/zh/guide/getting-started" },
      { text: "概念", link: "/zh/concepts/sessions" },
      { text: "API", link: "/api/" },
    ],
    sidebar: {
      "/api/": apiReference
    },
    search: {
      provider: "local",
      options: {
        detailedView: true
      }
    },
    socialLinks: repositoryUrl ? [{ icon: "github", link: repositoryUrl }] : [],
    ...(repositoryUrl ? {
      editLink: {
        pattern: `${repositoryUrl}/edit/${encodeURIComponent(repositoryBranch)}/doc/site/:path`,
        text: "在 GitHub 编辑此页"
      }
    } : {}),
    outline: { level: [2, 3], label: "本页内容" },
    docFooter: { prev: "上一页", next: "下一页" },
    footer: {
      message: "使用能力，不托管私钥。",
      copyright: "Keymaster Connect"
    }
  },
  vite: {
    server: {
      ...(extraAllowedHosts.length > 0 ? { allowedHosts: extraAllowedHosts } : {})
    },
    define: {
      __CONNECT_SOURCE_URL__: JSON.stringify(sourceUrl)
    }
  }
});
