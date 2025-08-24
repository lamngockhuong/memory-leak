import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Memory Leak Guide",
  description:
    "Comprehensive guide to understand, detect, and prevent memory leaks across multiple programming languages",
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Getting Started", link: "/getting-started" },
          { text: "Languages", link: "/languages/" },
          { text: "Tools", link: "/tools/" },
          { text: "Best Practices", link: "/best-practices/" },
        ],
      },
    },
    vi: {
      label: "Tiếng Việt",
      lang: "vi",
      link: "/vi/",
      themeConfig: {
        nav: [
          { text: "Trang chủ", link: "/vi/" },
          { text: "Hướng dẫn bắt đầu", link: "/vi/getting-started" },
          { text: "Ngôn ngữ", link: "/vi/languages/" },
          { text: "Công cụ", link: "/vi/tools/" },
          { text: "Mẹo hay", link: "/vi/best-practices/" },
        ],
      },
    },
  },
  themeConfig: {
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
  },
});
