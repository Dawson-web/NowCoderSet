# NowCoderSet

牛客网数据采集助手 — Chrome 扩展插件，一键爬取牛客讨论区文章，支持去重、历史记录管理与多格式导出。

## 功能特性

- **用户信息展示**：展示当前牛客网用户的个人资料、求职意向等信息
- **文章批量爬取**：按关键词搜索并批量获取讨论区文章内容
- **智能去重**：基于文章 UUID 进行跨任务去重，避免重复抓取
- **历史记录管理**：通过 Zustand + localStorage 持久化存储每次爬取的配置、日志与结果
- **多格式导出**：支持将爬取结果导出为 JSON 或 Markdown 格式
- **实时日志**：爬取过程中实时展示操作日志

## 技术栈

- **框架**：React 18 + TypeScript
- **构建**：Vite + esbuild
- **UI 组件库**：Arco Design
- **样式**：Tailwind CSS
- **状态管理**：Zustand（persist 中间件）
- **数据请求**：TanStack React Query + Axios
- **扩展规范**：Chrome Extension Manifest V3

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 加载扩展

1. 打开 Chrome，进入 `chrome://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择项目 `dist/` 目录

## 项目结构

```
src/
├── background/    # Service Worker（后台脚本）
├── content/       # Content Script（侧边栏面板）
│   ├── components/  # UI 组件（UserInfoCard、CrawlPanel、HistoryPanel 等）
│   ├── FloatingPanel.tsx  # 主面板容器
│   ├── main.tsx     # 入口 & 侧边栏挂载
│   └── style.css    # 全局样式
├── popup/         # Popup 页面
├── service/       # API 服务层
├── store/         # Zustand 状态管理
├── styles/        # Tailwind 入口
└── window/        # 独立窗口页面
```
