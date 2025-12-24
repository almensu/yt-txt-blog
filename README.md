# YouTube to Styled Blog Generator

一个本地化工具，从YouTube视频获取字幕，自动生成纯文本资产，并提供风格化转换功能生成博客文章。

## 🎯 核心功能

### P01: TXT资产风格化系统
- **资产创建**: 手动创建和管理TXT资产
- **风格管理**: 管理多种写作风格配置
- **风格转换**: 使用AI将TXT资产转换为风格化文章
- **文章管理**: 查看、删除生成的文章

### P02: YouTube集成系统 (NEW)
- **YouTube内容获取**: 使用yt-dlp下载字幕
- **自动导入**: 字幕处理后自动导入为TXT资产
- **元数据保留**: 保留视频ID、标题、语言等元数据
- **4步工作流**: URL输入 → 字幕下载 → 处理导入 → 风格转换

## 🏗️ 技术架构

### 后端 (TypeScript + Express.js)
- **框架**: Express.js
- **语言**: TypeScript (ES2022)
- **YouTube下载**: yt-dlp命令行工具
- **清洗脚本**: Python 3.x
- **日志**: Winston

### 前端 (React + Vite)
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **路由**: React Router v6
- **样式**: Tailwind CSS

### 端口配置
| 系统 | 端口 | 环境变量 |
|------|------|---------|
| 后端API | 3000 | NEW_SYSTEM_PORT |
| 前端开发 | 5173 | (Vite default) |

## 📁 项目结构

```
yt-txt-blog-v0.2/
├── src/
│   ├── backend/               # YouTube处理服务 (port 8000)
│   │   ├── index.ts          # Express服务器
│   │   ├── controllers/       # 控制器
│   │   └── services/          # 业务逻辑
│   ├── routes/               # API路由
│   │   ├── assets.ts         # 资产CRUD
│   │   ├── styles.ts         # 风格管理
│   │   ├── convert.ts        # 风格转换
│   │   └── youtube.ts        # YouTube集成 (P02)
│   ├── services/             # 业务服务
│   │   ├── importService.ts  # 自动导入服务 (P02)
│   │   └── assetStorage.ts   # 资产存储
│   ├── storage/              # 数据存储
│   │   └── assetStorage.ts   # JSON文件存储
│   ├── types/                # TypeScript类型
│   ├── server.ts             # 主服务器 (port 3000)
│   └── frontend/             # React前端
│       └── src/
│           ├── pages/        # 页面组件
│           ├── components/   # UI组件
│           ├── stores/       # Zustand状态
│           └── services/     # API客户端
├── storage/                  # 本地存储
│   ├── downloads/           # 下载的字幕
│   ├── processed/           # 处理后的文本
│   └── logs/                # 日志文件
├── project_data/            # 资产数据
│   ├── assets/             # TXT资产
│   ├── articles/           # 生成的文章
│   └── styles/             # 风格配置
├── .agent/                 # Claude Code工作区
└── docs/                   # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- Python >= 3.8
- yt-dlp (最新版本)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd yt-txt-blog-v0.2
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件配置相关参数
```

### 环境变量配置

```bash
# 端口配置
PORT=8000                    # YouTube处理服务端口 (旧系统)
NEW_SYSTEM_PORT=3000         # 新系统API端口

# 存储路径
STORAGE_BASE_PATH=./storage
PROJECT_DATA_BASE=./project_data

# Python配置
PYTHON_PATH=python3
CLEANING_SCRIPT_PATH=./scripts/clean_subtitle.py

# yt-dlp配置
YT_DLP_PATH=yt-dlp
YT_DLP_TIMEOUT=120000
```

4. **安装yt-dlp**
```bash
# macOS
brew install yt-dlp

# Ubuntu/Debian
sudo apt install yt-dlp

# 使用pip
pip install yt-dlp
```

5. **启动服务**
```bash
# 启动后端服务
npm start

# 或开发模式
npm run dev:backend
```

6. **启动前端**
```bash
cd src/frontend
npm install
npm run dev
```

7. **访问应用**
- 前端界面: http://localhost:5173
- 后端API: http://localhost:3000
- 健康检查: http://localhost:3000/health

## 📝 使用指南

### YouTube集成工作流 (P02)

1. **输入YouTube URL**
   - 访问 YouTube 页面
   - 输入YouTube视频URL
   - 选择字幕语言

2. **下载字幕**
   - 点击下载按钮
   - 系统使用yt-dlp下载字幕
   - 下载完成后显示视频信息

3. **处理和导入**
   - 点击"Process & Import"按钮
   - Python脚本清洗字幕数据
   - 自动创建TXT资产（包含视频元数据）

4. **风格转换**
   - 跳转到Convert页面
   - 选择新创建的资产
   - 选择写作风格
   - 生成风格化文章

### 手动资产管理 (P01)

1. **创建资产**
   - 访问 Assets 页面
   - 输入标题和内容
   - 点击创建

2. **风格转换**
   - 访问 Convert 页面
   - 选择资产和风格
   - 生成文章

3. **查看文章**
   - 访问 Articles 页面
   - 展开/收起查看内容
   - 删除不需要的文章

## 🔌 API文档

### YouTube集成 (P02)

#### 下载字幕
```http
POST /api/youtube/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=xxx",
  "languages": ["en", "zh"]
}
```

#### 处理和导入
```http
POST /api/youtube/process
Content-Type: application/json

{
  "videoId": "xxx",
  "language": "en"
}
```

#### 列出已处理视频
```http
GET /api/youtube/videos
```

### 资产管理 (P01)

#### 获取所有资产
```http
GET /api/assets
```

#### 创建资产
```http
POST /api/assets
Content-Type: application/json

{
  "title": "资产标题",
  "content": "资产内容",
  "source_video_id": "xxx",      // 可选
  "source_video_title": "xxx",   // 可选
  "source_language": "en",        // 可选
  "source_type": "youtube"        // 可选
}
```

### 风格转换

#### 转换资产
```http
POST /api/convert
Content-Type: application/json

{
  "asset_id": "asset-uuid",
  "style_id": "style-name",
  "model": "gpt-4"  // 可选
}
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 类型检查
npm run type-check

# 构建验证
npm run build
```

## Stop Hook 自动运行测试
- 目的：在任务停止或阶段收尾时自动触发测试，保障验收闭环的一致性
- 路径建议：`.claude/hooks/stop-hook.sh`
- 执行逻辑：
  - 若 `package.json` 存在且包含 `test` 脚本：执行 `npm test`
  - 否则：执行 `bash .claude/skills/project-architect/scripts/verify_gate.sh`
- 日志与资产：
  - 日志写入 `.agent/logs/diagnose/stop-<YYYY-MM-DD>.log`
  - 产物写入 `.agent/outputs/text/`，并登记 `.agent/manifests/`
- 安全与约束：拒绝路径穿越；禁止写入项目根与 `src/`
- 集成点：在 Phase 4 施工循环的收尾与 Phase 5 验收前触发

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请提交Issue或联系维护者。
