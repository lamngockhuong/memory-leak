import { defineConfig } from "vitepress";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  title: "Memory Leak Guide",
  description:
    "Comprehensive guide to understand, detect, and prevent memory leaks across multiple programming languages",
  lastUpdated: true,
  // ignoreDeadLinks: true,
  vite: {
    // Build optimization to handle chunk size warnings
    build: {
      chunkSizeWarningLimit: Infinity, // Disable chunk size warnings for docs
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split node_modules into more granular chunks
            if (id.includes("node_modules")) {
              if (id.includes("vue")) {
                return "vue";
              }
              if (id.includes("vitepress")) {
                return "vitepress";
              }
              if (id.includes("@vueuse")) {
                return "vueuse";
              }
              if (id.includes("markdown-it")) {
                return "markdown";
              }
              if (id.includes("shiki") || id.includes("highlight")) {
                return "syntax-highlight";
              }
              if (id.includes("lodash") || id.includes("ramda")) {
                return "utils";
              }
              // Other vendor libraries
              return "vendor";
            }

            // Split large documentation files if any
            if (id.includes("/docs/")) {
              if (id.includes("/demos/")) {
                return "docs-demos";
              }
              if (id.includes("/patterns/")) {
                return "docs-patterns";
              }
              if (id.includes("/languages/")) {
                return "docs-languages";
              }
            }
          },
        },
      },
    },
    plugins: [ViteImageOptimizer({})],
  },

  head: [
    // Favicon configurations
    ["link", { rel: "shortcut icon", href: "/favicon.ico", sizes: "48x48" }],
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    [
      "link",
      {
        rel: "icon",
        href: "/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-WRS368HBX2",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WRS368HBX2');`,
    ],
  ],
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        outline: {
          level: [2, 3],
        },
        nav: [
          { text: "Home", link: "/" },
          { text: "Getting Started", link: "/getting-started" },
          // { text: "Languages", link: "/languages/" },
          // { text: "Tools", link: "/tools/" },
          // { text: "Best Practices", link: "/best-practices/" },
        ],
        sidebar: [
          {
            text: "Introduction",
            items: [
              {
                text: "What is Memory Leak?",
                link: "/introduction/what-is-memory-leak",
              },
              {
                text: "Why It Matters",
                link: "/introduction/why-it-matters",
              },
            ],
          },
          {
            text: "Language-Specific Guides",
            items: [
              { text: "JavaScript/TypeScript", link: "/languages/javascript" },
              // { text: "Java", link: "/languages/java" },
              // { text: "Kotlin", link: "/languages/kotlin" },
              // { text: "Go", link: "/languages/go" },
              // { text: "Node.js", link: "/languages/nodejs" },
            ],
          },
          {
            text: "Common Leak Patterns",
            items: [
              { text: "Global Variables", link: "/patterns/global-variables" },
              { text: "Timers & Intervals", link: "/patterns/timers" },
              // { text: "Event Listeners", link: "/patterns/event-listeners" },
              // { text: "Closures", link: "/patterns/closures" },
              // { text: "Caching", link: "/patterns/caching" },
              // { text: "DOM References", link: "/patterns/dom-references" },
            ],
          },
          {
            text: "Demo Projects",
            items: [
              { text: "NestJS Demo", link: "/demos/nestjs" },
              { text: "Java Demo", link: "/demos/java" },
              { text: "Go Demo", link: "/demos/go" },
              { text: "Kotlin Demo", link: "/demos/kotlin" },
            ],
          },
        ],
      },
    },
    vi: {
      label: "Tiếng Việt",
      lang: "vi",
      link: "/vi/",
      themeConfig: {
        lastUpdated: {
          text: "Cập nhật lần cuối",
        },
        editLink: {
          text: "Chỉnh sửa trang này",
        },
        outline: {
          label: "Mục lục",
          level: [2, 3],
        },
        nav: [
          { text: "Trang chủ", link: "/vi/" },
          { text: "Hướng dẫn bắt đầu", link: "/vi/getting-started" },
          // { text: "Ngôn ngữ", link: "/vi/languages/" },
          // { text: "Công cụ", link: "/vi/tools/" },
          // { text: "Mẹo hay", link: "/vi/best-practices/" },
        ],
        sidebar: [
          {
            text: "Giới thiệu",
            items: [
              {
                text: "Memory Leak là gì?",
                link: "/vi/introduction/what-is-memory-leak",
              },
              {
                text: "Tại sao quan trọng?",
                link: "/vi/introduction/why-it-matters",
              },
            ],
          },
          {
            text: "Hướng dẫn theo ngôn ngữ",
            items: [
              {
                text: "JavaScript/TypeScript",
                link: "/vi/languages/javascript",
              },
              // { text: "Java", link: "/vi/languages/java" },
              // { text: "Kotlin", link: "/vi/languages/kotlin" },
              // { text: "Go", link: "/vi/languages/go" },
              // { text: "Node.js", link: "/vi/languages/nodejs" },
            ],
          },
          {
            text: "Các Pattern Memory Leak phổ biến",
            items: [
              {
                text: "Global Variables",
                link: "/vi/patterns/global-variables",
              },
              { text: "Timers & Intervals", link: "/vi/patterns/timers" },
              // { text: "Event Listeners", link: "/vi/patterns/event-listeners" },
              // { text: "Closures", link: "/vi/patterns/closures" },
              // { text: "Caching", link: "/vi/patterns/caching" },
              // { text: "DOM References", link: "/vi/patterns/dom-references" },
            ],
          },
          {
            text: "Demo Projects",
            items: [
              { text: "NestJS Demo", link: "/demos/nestjs" },
              { text: "Java Demo", link: "/demos/java" },
              { text: "Go Demo", link: "/demos/go" },
              { text: "Kotlin Demo", link: "/demos/kotlin" },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/lamngockhuong/memory-leak" },
    ],
    search: {
      provider: "local",
    },
    editLink: {
      pattern:
        "https://github.com/lamngockhuong/memory-leak/edit/main/docs/:path",
    },
    footer: {
      message:
        "Released under the <a href='https://github.com/lamngockhuong/memory-leak/blob/main/LICENSE'>MIT License</a>.",
      copyright:
        "Copyright © 2025-present <a href='https://khuong.dev' target='_blank'>Khuong Dev</a>",
    },
  },
  sitemap: {
    hostname: "https://khuong.dev",
  },
});
