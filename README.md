# YouTube to Pure Text Generator

一个本地化工具，能够从YouTube视频URL获取字幕，通过Python清洗脚本生成纯文本，提供简易前端界面进行操作和预览。

## 🎯 核心功能

- **YouTube内容获取**: 使用yt-dlp下载JSON3字幕格式
- **字幕处理**: Python清洗脚本移除时间戳和格式标记
- **简易前端界面**: 输入URL、下载、预览TXT文档
- **本地存储**: JSON3和TXT文件本地存储
- **系统集成**: 前后端完整集成测试

## 🏗️ 技术架构

### 后端 (TypeScript + Express.js)
- **框架**: Express.js
- **语言**: TypeScript (严格模式)
- **YouTube下载**: yt-dlp命令行工具
- **清洗脚本**: Python 3.x
- **日志**: Winston
- **测试**: Jest + Supertest

### 前端 (待定)
- **框架**: React 或 Vue.js (待确定)
- **构建工具**: Vite 或 Webpack
- **UI组件**: 轻量级，自定义组件为主

### 开发工具
- **代码质量**: ESLint + Prettier
- **类型检查**: TypeScript严格模式
- **测试**: Jest (单元测试 + 集成测试)
- **构建**: TypeScript编译器

## 📁 项目结构

```
yt-txt-blog-v0.2/
├── src/
│   ├── shared/                 # 共享类型和工具
│   │   ├── types/             # TypeScript类型定义
│   │   ├── enums/             # 枚举定义
│   │   ├── utils/             # 工具函数
│   │   └── tests/             # 共享测试
│   ├── backend/               # 后端代码
│   │   ├── controllers/       # 控制器
│   │   ├── services/          # 业务逻辑
│   │   ├── models/            # 数据模型
│   │   ├── routes/            # 路由定义
│   │   ├── middleware/        # 中间件
│   │   ├── config/            # 配置文件
│   │   ├── utils/             # 工具函数
│   │   └── tests/             # 后端测试
│   └── frontend/              # 前端代码
│       ├── src/               # 前端源码
│       ├── public/            # 静态资源
│       └── dist/              # 构建输出
├── .agent/                    # Claude Code工作区
│   ├── specs/                 # 技术规格文档
│   ├── planning/              # 项目规划
│   └── memory/                # 活动上下文
├── storage/                   # 本地存储
│   ├── downloads/             # 下载的字幕文件
│   ├── processed/             # 处理后的文本
│   ├── temp/                  # 临时文件
│   └── logs/                  # 日志文件
├── scripts/                   # Python清洗脚本
├── docs/                      # 项目文档
└── tests/                     # 端到端测试
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

4. **安装yt-dlp**
```bash
# macOS
brew install yt-dlp

# Ubuntu/Debian
sudo apt install yt-dlp

# Windows (使用pip)
pip install yt-dlp

# 或者使用Python
pip install yt-dlp
```

5. **启动开发服务器**
```bash
# 同时启动前后端开发服务器
npm run dev

# 或者分别启动
npm run dev:backend  # 仅启动后端
npm run dev:frontend # 仅启动前端
```

6. **访问应用**
- 前端界面: http://localhost:5173
- 后端API: http://localhost:3000
- 健康检查: http://localhost:3000/health

## 📋 可用命令

```bash
# 开发
npm run dev              # 启动前后端开发服务器
npm run dev:backend      # 仅启动后端
npm run dev:frontend     # 仅启动前端

# 构建
npm run build            # 构建前后端
npm run build:backend    # 仅构建后端
npm run build:frontend   # 仅构建前端

# 生产
npm start                # 启动生产服务器

# 测试
npm test                 # 运行所有测试
npm run test:watch       # 监视模式运行测试
npm run test:coverage    # 生成测试覆盖率报告

# 代码质量
npm run lint             # 运行ESLint检查
npm run lint:fix         # 自动修复ESLint错误
npm run type-check       # TypeScript类型检查

# 清理
npm run clean            # 清理构建文件
npm run clean:all        # 清理所有文件和依赖
```

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试覆盖率要求
- 全局覆盖率: > 70%
- 分支覆盖率: > 70%
- 函数覆盖率: > 70%
- 行覆盖率: > 70%

## 📝 API文档

### 健康检查
```
GET /health
```

### 视频信息
```
GET /api/video/info?url={YOUTUBE_URL}
```

### 字幕下载
```
POST /api/subtitles/download
```

### 字幕处理
```
POST /api/subtitles/process
```

### 文件预览
```
GET /api/files/preview/{fileId}
```

### 系统状态
```
GET /api/system/status
```

## 🔧 配置

主要配置项在 `.env` 文件中：

- **端口配置**: `PORT`, `HOST`
- **yt-dlp配置**: `YT_DLP_PATH`, `YT_DLP_TIMEOUT`
- **存储配置**: `STORAGE_BASE_PATH`, `STORAGE_MAX_SIZE`
- **处理配置**: `PYTHON_PATH`, `CLEANING_SCRIPT_PATH`
- **日志配置**: `LOG_LEVEL`, `LOG_TO_FILE`

详细配置说明请参考 `.env.example` 文件。

## 🤝 开发指南

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 编写单元测试，保持测试覆盖率
- 使用语义化的Git提交信息

### 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 分支策略
- `main`: 生产环境代码
- `develop`: 开发环境代码
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请提交Issue或联系维护者。