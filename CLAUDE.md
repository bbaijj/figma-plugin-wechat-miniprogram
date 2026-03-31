# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Figma 插件，用于将 Figma 设计元素转换为微信小程序（WeChat Mini Program）样式代码。主要功能是将 Figma 中的像素（px）单位转换为微信小程序的响应式像素（rpx）单位，并支持自定义转换倍率。

## 开发命令

### 构建和开发
- `npm run build` - 编译 TypeScript 到 JavaScript
- `npm run watch` - 监听文件变化并自动编译
- `npm run lint` - 运行 ESLint 代码检查
- `npm run lint:fix` - 自动修复 ESLint 可修复的问题

### 项目初始化
1. 安装依赖：`npm install`（或使用 pnpm）
2. 确保已安装 TypeScript：`npm install -g typescript`
3. 开发时使用 `npm run watch` 保持自动编译

## 架构说明

### 文件结构
```
├── code.ts              # 主插件逻辑（TypeScript 源码）
├── code.js              # 编译后的 JavaScript 代码（Figma 实际运行）
├── ui.html              # 插件设置界面（HTML/CSS/JS）
├── manifest.json        # 插件配置文件
├── package.json         # 项目依赖和脚本
├── tsconfig.json        # TypeScript 编译配置
└── eslint.config.js     # ESLint 配置
```

### 核心架构

#### 1. 插件入口和生命周期
- `code.ts` 是主入口文件，包含 Figma 插件 API 的所有逻辑
- 插件支持两种运行模式：
  - **代码生成模式**：在 Figma 的 Inspect 面板中自动运行，通过 `figma.codegen.on('generate')` 监听
  - **设置界面模式**：通过插件菜单命令触发，显示 `ui.html` 界面

#### 2. 样式转换系统
- **单位转换**：`pxToRpx(value, conversionRate)` 函数处理 px 到 rpx 的转换
- **样式提取**：`generateWechatMiniProgramCode(node, conversionRate)` 从 Figma 节点提取样式
- **属性映射**：将 Figma 的 Auto Layout 属性（`layoutMode`、`primaryAxisAlignItems` 等）映射为 CSS Flexbox 属性

#### 3. 设置管理
- **转换倍率持久化**：使用 `figma.clientStorage` API 保存用户设置的转换倍率
- **默认倍率**：`1px = 2rpx`，可通过设置界面调整（0.1-10 范围）

#### 4. 界面通信
- **消息协议**：`ui.html` 与 `code.ts` 通过 `figma.ui.postMessage()` 和 `figma.ui.onmessage` 通信
- **命令处理**：`figma.on('run', ({ command }) => { ... })` 处理菜单命令

### 支持的样式属性
插件从 Figma 节点提取并转换以下属性：

#### 布局属性
- Flexbox 布局（当节点有 `layoutMode` 属性时）
- 外边距（`marginTop`/`marginRight`/`marginBottom`/`marginLeft`）
- 内边距（`paddingTop`/`paddingRight`/`paddingBottom`/`paddingLeft`）
- 宽度和高度

#### 视觉属性
- 圆角（统一或四角独立）
- 背景颜色（`fills` 属性）
- 边框（`strokes`、`strokeWeight`）
- 透明度（`opacity`）

#### 文本属性
- 字体大小、粗细、家族
- 行高、字间距
- 文本对齐、装饰、大小写转换

### 输出格式
插件生成纯 CSS 样式声明，每行一个属性，分号分隔。**不包含**类名、注释或 CSS 规则包装。

示例输出：
```
width: 200rpx;
height: 80rpx;
padding: 20rpx 32rpx;
font-size: 28rpx;
```

## 开发注意事项

### TypeScript 类型
- 使用 `@figma/plugin-typings` 提供 Figma API 类型定义
- 通过类型断言 `(node as any)` 访问动态属性
- `SceneNode` 是 Figma 节点的基类型

### Figma API 限制
- 代码生成回调（`figma.codegen.on('generate')`）必须**同步**返回结果
- UI 界面和代码生成不能同时使用 `figma.showUI()`，需通过命令分离
- 插件存储使用异步 API（`figma.clientStorage.getAsync()`/`setAsync()`）

### 样式处理模式
- 使用数组收集样式字符串（`styles: string[]`），最后连接
- 智能简写：检测相同值生成简写属性（如 `padding: 10rpx` vs `padding: 10rpx 20rpx 10rpx 20rpx`）
- 条件输出：仅当属性存在且有效时才生成样式

## 测试和调试

### 在 Figma 中测试
1. 运行 `npm run build` 编译插件
2. 在 Figma 中导入插件（开发模式）
3. 选择设计元素，在 Inspect 面板查看生成的代码
4. 通过插件菜单打开设置界面调整转换倍率

### 常见调试场景
- **转换倍率不生效**：检查 `currentConversionRate` 是否正确加载
- **样式属性缺失**：验证 Figma 节点是否包含对应属性
- **布局属性未转换**：确认节点是否启用了 Auto Layout

## 扩展建议

### 添加新样式属性
1. 在 `generateWechatMiniProgramCode()` 中添加属性检测逻辑
2. 使用 `'propertyName' in node` 检查属性存在性
3. 通过 `pxToRpx()` 转换数值属性
4. 将样式字符串添加到 `styles` 数组

### 修改输出格式
- 如需添加类名或注释，修改 `generateWechatMiniProgramCode()` 的返回值格式
- 如需多语言支持，更新 `manifest.json` 中的 `codegenLanguages` 配置

### 性能优化
- 样式收集使用数组而非字符串拼接
- 避免在代码生成回调中进行异步操作
- 复杂的计算可提取为独立函数