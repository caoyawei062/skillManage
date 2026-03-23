# Skill Manager

一个用于管理 Alma skills 的桌面应用，基于 Electron + Vite + React + TypeScript + TailwindCSS 构建。

## 功能特性

- 🔍 **浏览 Skills** - 自动扫描并展示所有已安装的 skills
- 📁 **多来源支持** - 支持全局路径、项目路径和远程仓库
- ✏️ **编辑 Skills** - 内置 Markdown 编辑器和预览
- 🏷️ **分类管理** - 按分类、标签和来源筛选
- 🎨 **主题系统** - 4 种深色主题 + 明暗模式
- 📦 **导入导出** - 从本地路径导入或创建新 skill

## 主题预览

| 主题 | 风格 |
|------|------|
| Classic Dark | 经典靛蓝色调 |
| Midnight Blue | 深海蓝 |
| Forest Dark | 森林绿 |
| Violet Dark | 紫罗兰 |

## 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

然后在浏览器中打开 http://localhost:5173

### 构建

```bash
# 构建 macOS 应用
pnpm build:mac

# 构建目录模式 (快速测试)
pnpm build
```

## 项目结构

```
skillmanage/
├── electron/          # Electron 主进程
│   ├── main.js       # 主进程入口
│   └── preload.js    # 预加载脚本
├── src/              # React 应用
│   ├── components/   # React 组件
│   ├── types/        # TypeScript 类型
│   ├── themes.ts     # 主题配置
│   └── App.tsx       # 主应用组件
├── public/           # 静态资源
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 默认 Skills 路径

- **全局**: `~/.config/alma/skills/`
- **项目**: 可自定义添加

## 技术栈

- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [Vite](https://vitejs.dev/) - 构建工具
- [React](https://react.dev/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [TailwindCSS](https://tailwindcss.com/) - 样式框架
