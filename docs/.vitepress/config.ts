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
        sidebar: [
          {
            text: "Introduction",
            items: [
              {
                text: "What is Memory Leak?",
                link: "/introduction/what-is-memory-leak",
              },
              { text: "Why It Matters", link: "/introduction/why-it-matters" },
              {
                text: "Common Patterns",
                link: "/introduction/common-patterns",
              },
            ],
          },
          {
            text: "Detection & Analysis",
            items: [
              { text: "Detection Strategies", link: "/detection/strategies" },
              { text: "Measuring Memory Usage", link: "/detection/measuring" },
              {
                text: "Heap Dump Analysis",
                link: "/detection/heap-dump-analysis",
              },
              { text: "Profiling Tools", link: "/detection/profiling-tools" },
            ],
          },
          {
            text: "Language-Specific Guides",
            items: [
              { text: "JavaScript/TypeScript", link: "/languages/javascript" },
              { text: "Java", link: "/languages/java" },
              { text: "Kotlin", link: "/languages/kotlin" },
              { text: "Go", link: "/languages/go" },
              { text: "Node.js", link: "/languages/nodejs" },
            ],
          },
          {
            text: "Common Leak Patterns",
            items: [
              { text: "Global Variables", link: "/patterns/global-variables" },
              { text: "Event Listeners", link: "/patterns/event-listeners" },
              { text: "Closures", link: "/patterns/closures" },
              { text: "Timers & Intervals", link: "/patterns/timers" },
              { text: "Caching", link: "/patterns/caching" },
              { text: "DOM References", link: "/patterns/dom-references" },
            ],
          },
          {
            text: "Tools & Utilities",
            items: [
              { text: "Browser Dev Tools", link: "/tools/browser-devtools" },
              { text: "Node.js Profiling", link: "/tools/nodejs-profiling" },
              { text: "Java Tools", link: "/tools/java-tools" },
              { text: "Go Tools", link: "/tools/go-tools" },
              { text: "CI/CD Integration", link: "/tools/cicd-integration" },
            ],
          },
          {
            text: "Best Practices",
            items: [
              {
                text: "Prevention Strategies",
                link: "/best-practices/prevention",
              },
              {
                text: "Code Review Guidelines",
                link: "/best-practices/code-review",
              },
              {
                text: "Testing for Memory Leaks",
                link: "/best-practices/testing",
              },
              {
                text: "Production Monitoring",
                link: "/best-practices/monitoring",
              },
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
        nav: [
          { text: "Trang chủ", link: "/vi/" },
          { text: "Hướng dẫn bắt đầu", link: "/vi/getting-started" },
          { text: "Ngôn ngữ", link: "/vi/languages/" },
          { text: "Công cụ", link: "/vi/tools/" },
          { text: "Mẹo hay", link: "/vi/best-practices/" },
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
              {
                text: "Các mẫu phổ biến",
                link: "/vi/introduction/common-patterns",
              },
            ],
          },
          {
            text: "Phát hiện & Phân tích",
            items: [
              {
                text: "Chiến lược phát hiện",
                link: "/vi/detection/strategies",
              },
              {
                text: "Đo lường sử dụng bộ nhớ",
                link: "/vi/detection/measuring",
              },
              {
                text: "Phân tích Heap Dump",
                link: "/vi/detection/heap-dump-analysis",
              },
              {
                text: "Công cụ Profiling",
                link: "/vi/detection/profiling-tools",
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
              { text: "Java", link: "/vi/languages/java" },
              { text: "Kotlin", link: "/vi/languages/kotlin" },
              { text: "Go", link: "/vi/languages/go" },
              { text: "Node.js", link: "/vi/languages/nodejs" },
            ],
          },
          {
            text: "Mẫu rò rỉ phổ biến",
            items: [
              { text: "Biến toàn cục", link: "/vi/patterns/global-variables" },
              { text: "Event Listeners", link: "/vi/patterns/event-listeners" },
              { text: "Closures", link: "/vi/patterns/closures" },
              { text: "Timers & Intervals", link: "/vi/patterns/timers" },
              { text: "Caching", link: "/vi/patterns/caching" },
              { text: "DOM References", link: "/vi/patterns/dom-references" },
            ],
          },
          {
            text: "Công cụ & Tiện ích",
            items: [
              { text: "Browser Dev Tools", link: "/vi/tools/browser-devtools" },
              { text: "Node.js Profiling", link: "/vi/tools/nodejs-profiling" },
              { text: "Java Tools", link: "/vi/tools/java-tools" },
              { text: "Go Tools", link: "/vi/tools/go-tools" },
              { text: "Tích hợp CI/CD", link: "/vi/tools/cicd-integration" },
            ],
          },
          {
            text: "Thực hành tốt nhất",
            items: [
              {
                text: "Chiến lược phòng tránh",
                link: "/vi/best-practices/prevention",
              },
              {
                text: "Hướng dẫn Code Review",
                link: "/vi/best-practices/code-review",
              },
              {
                text: "Testing Memory Leaks",
                link: "/vi/best-practices/testing",
              },
              {
                text: "Giám sát Production",
                link: "/vi/best-practices/monitoring",
              },
            ],
          },
          {
            text: "Dự án Demo",
            items: [
              { text: "NestJS Demo", link: "/vi/demos/nestjs" },
              { text: "Java Demo", link: "/vi/demos/java" },
              { text: "Go Demo", link: "/vi/demos/go" },
              { text: "Kotlin Demo", link: "/vi/demos/kotlin" },
            ],
          },
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
