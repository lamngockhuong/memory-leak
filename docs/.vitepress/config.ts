import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Memory Leak Guide",
  description:
    "Comprehensive guide to understand, detect, and prevent memory leaks across multiple programming languages",
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
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
});
