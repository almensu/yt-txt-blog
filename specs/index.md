# Spec Index

本项目采用规范驱动开发（Spec-Driven Development），所有版本化规格包存放于 `specs/` 目录。

## 当前 MVP (Current)

- **01_mvp** - 文本资产转风格化博客文章功能
  - 状态: 🚧 In Progress
  - 开始日期: 2025-12-23
  - 核心目标: 实现 txt 资产管理与风格化文章转换的端到端闭环

## 历史版本 (History)

_暂无历史版本_

## 版本命名规范

- **01_mvp**: 第一个最小可行产品
- **02_mvp**: 第二个迭代版本
- **NN_mvp**: 第 N 个迭代版本

## MVP 包结构

每个 MVP 目录包含：
```
specs/<NN_mvp>/
├── prd.md           # 产品需求文档（如有新增或变更）
├── requirements.md  # 需求规格说明
├── design.md        # 技术设计文档
├── tasks.md         # 任务拆解清单
└── adr/             # 架构决策记录（可选）
    └── XXXX-*.md
```

## Cutline 记录

### 01_mvp 边界明确

**In-Scope**:
- 文本资产 CRUD 管理（UUID v4）
- 两种风格提示词配置（WSJ、钻石型）
- 智谱 AI API 集成（OpenAI SDK 兼容）
- 文章生成与文件存储
- 基础前端界面

**Out-of-Scope**:
- YouTube 字幕下载（已存在外部工具）
- 多平台适配输出
- 版本管理系统
- 分块处理长内容（4小时+播客）
- 批量处理
- 用户认证与权限
