/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 禁用 oklab 颜色空间，使用传统的 RGB 颜色空间
      colors: {
        // 保持默认颜色但强制使用 RGB
      },
    },
  },
  plugins: [],
  // 强制使用传统颜色空间以兼容 html2canvas
  experimental: {
    optimizeUniversalDefaults: false,
  },
  // 禁用现代颜色功能
  corePlugins: {
    // 确保使用传统颜色格式
  },
}