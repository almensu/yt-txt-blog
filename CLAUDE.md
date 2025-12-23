# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库开展工作提供指南。

## 项目概览

这是一个从 YouTube 转文本的博客项目（yt-txt-blog-v0.2），以 Claude Code 工作区构建。项目处于早期初始化阶段，核心应用代码较少，但已具备完善的技能与代理生态。

## Repository Structure

```
yt-txt-blog-v0.2/
├── .claude/                    # Claude Code workspace configuration
│   ├── agents/                 # Specialized sub-agents
│   ├── commands/               # Custom slash commands
│   └── skills/                 # Reusable capability modules
├── docs/                       # Documentation (currently empty)
└── CLAUDE.md                   # This file
```

## 角色定位与铁律

- 你不是打字员，你是“建筑承包商”
- 物理隔离：规划与记忆存放于 `.agent/`，`src/` 仅存放纯净代码
- P-序列版本：所有规划文件遵循 `P[序号]-[功能名]-[类型].md`
- 无图纸不施工：没有 MVP/Task 定义，不写任何业务代码
- 验收闭环：任务完成标准为通过 `verify_gate.sh` 后再获人工批准

## 目录治理原则与质量红线

- 目录隔离：`src/` 仅存放生产代码；`.agent/` 存放所有规格、文档与记忆
- 文档位置：除本指南外，严禁在根目录创建说明文档，统一放入 `.agent/`
- 质量红线：TypeScript 禁用 `any`；遵循“先接口定义（Spec），后实现”的顺序
- MVP 交付标准：服务可启动且日志无报错；自动化测试（Lint/Unit）通过；人工验收通过

## 资产存储约束

- 输出目录：所有技能输出仅可写入 `.agent/outputs/<type>/`
- 禁止写入：严禁向项目根目录与 `src/` 目录写入任何资产
- 命名规范：`P[序号]-[功能名]-[资产类型]-[YYYYMMDD-HHMM].ext`
- 元数据清单：每次生成必须写入 `.agent/manifests/P[序号]-[功能名]-manifest.json`
  - 必含字段：`p_sequence`、`name`、`skill_id`、`created_at`、`inputs`、`outputs`、`hashes`
- 验收闭环：生成后执行机器自检（lint/test/build），人审通过后方可归档

## P-序列工作流（SOP）

- 初始化：运行 `bash .claude/skills/project-architect/scripts/init_agent.sh` 建立 `.agent` 结构
- 规划与定界：创建 `PXX-[Name]-MVP.md`，明确 In/Out-Scope，等待用户批准
- 路径拆解：生成 `PXX-[Name]-Task.md`，并锁定 `.agent/memory/active_context.md`
- 施工循环：按 Task 执行，先写测试；完成一项即由 `[ ]` 改为 `[x]`
- 最终验收：运行 `bash .claude/skills/project-architect/scripts/verify_gate.sh` 机器自检；通过后等待人工审核

## 模板：MVP 定义

```
# P[XX]: [Feature Name] MVP Definition

🎯 核心目标
一句话描述要解决的问题

✅ In-Scope（本次仅交付）
1. 功能点 A
2. 功能点 B

⛔ Out-of-Scope（本次坚决不做）
- 功能 C
- 优化 D

🧪 验收标准
- [ ] 自动化测试通过
- [ ] 关键路径人工验证通过
```

## 模板：任务拆解

```
# P[XX]: Execution Tasks
状态：🚧 In Progress

Phase 1: Design & Spec
- [ ] 生成 `.agent/specs/P[XX]-Spec.md`
- [ ] 定义 TypeScript 接口/类型

Phase 2: Core Logic
- [ ] 实现 Service 层核心逻辑
- [ ] 编写单元测试（优先）

Phase 3: Integration & Verify
- [ ] 实现 API/UI 层集成
- [ ] 运行 `verify_gate.sh` 进行机器验收
- [ ] 等待人工验收（Human Review）
```

## 验收闸门与检查项

- 静态检查：运行 Lint 与类型检查（如存在对应脚本）
- 单元测试：`npm test` 必须通过，失败则阻断交付
- 构建检查：`npm run build` 可选；成功则记录为构建通过
- 机器自检通过后，需暂停并等待人工验收反馈

## 工具与脚本用法

- 初始化代理结构
```bash
bash .claude/skills/project-architect/scripts/init_agent.sh
```

- 运行验收闸门
```bash
bash .claude/skills/project-architect/scripts/verify_gate.sh
```

## Claude Code 配置

### 自定义斜杠命令

项目在 `.claude/commands/` 中包含以下自定义命令：

- **/slash-system-architect** - 启动系统架构设计技能，产出可落地架构
- **/slash-taskskill** - 规范驱动的任务执行，具备上下文控制与校验
- **/slash-skill-creator** - 创建高效技能并扩展 Claude 能力边界
- **/slash-generating-prds** - 基于笔记与想法生成产品需求文档（PRD）

### 技能生态

工作区在 `.claude/skills/` 中包含 20+ 个专业技能：

#### 关键技能
- **project-architect** - 项目首席架构师 enforcing "规范驱动开发" (spec-driven development)
- **wechat-share-card-automation** - WeChat sharing card automation generator (Node.js/Express)
- **playwright-skill** - Browser automation and testing capabilities
- **system-architect** - System architecture design from requirements
- **api-designer** - API and data type design toolkit
- **frontend-design** - Production-grade frontend interface creation
- **generating-prds** - Product requirements document generation
- **mvp_skill** - Versioned Spec packages and MVP-driven development
- **task_skill** - Spec-driven task execution with verification

#### 开发命令
针对 **wechat-share-card-automation** 技能：
```bash
# 启动生产服务器
npm start

# 启动开发服务器
npm run dev
```

### 代理系统

代理定义在 `.claude/agents/` 中，为复杂多步骤任务提供专业子流程能力。

## 快速上手清单

- 运行初始化脚本，生成 `.agent` 目录结构
- 创建 `PXX-[Name]-MVP.md` 并明确 In/Out-Scope
- 用户批准后生成 `PXX-[Name]-Task.md`，锁定 `active_context`
- 按任务执行并编写单元测试，逐项勾选完成
- 运行 `verify_gate.sh` 进行机器验收，等待人工验收
- 通过后归档并开始下一个 P 序列

## 开发模式

### 规范驱动开发（SDD）
项目遵循 **project-architect** 技能提出的“规范驱动开发”方法论：

1. P 序列版本化：所有规划文件遵循 `P[序号]-[功能名]-[类型].md` 格式
2. 无规格不落地：在任务拆分前必须有 MVP 定义
3. 验证闸门：任务需通过 `verify_gate.sh` 校验并完成人工批准
4. 物理分离：规划/记忆在 `.agent/`，洁净代码在 `src/`

### 技能使用范式
- 当任务与技能描述高度匹配时，直接调用技能
- 复杂工作流使用合适的 `subagent_type` 进行编排
- 使用斜杠命令进行标准化流程
- 技能同时提供 CLI 与编程接口

### 项目初始化
在创建新项目时：
1. 使用 `/slash-system-architect` 进行架构设计
2. 遵循 `project-architect` 技能的初始化工作流
3. 创建 P 序列规划文档
4. 通过 `/slash-taskskill` 执行任务并进行验证

## 系统架构规范与交付

- 输出硬规则
  - 默认中文，避免空话与宏大叙事，明确取舍与边界
  - 必须写清验收与指标口径；先输出可评审版本后再迭代
- 默认交付物
  - 架构文档：使用 `/.claude/skills/system-architect/reference/architecture-template.md`
  - ADR：使用 `/.claude/skills/system-architect/reference/adr-template.md`（1–3 条关键决策）
  - 图：至少两张（系统上下文、关键链路时序或数据流），参考 `/.claude/skills/system-architect/reference/diagram-patterns.md`
  - 风险清单与灰度回滚方案
- 工作流清单
  - 读取输入与边界 → 识别目标与约束（含非功能需求）
  - 产出 2–3 方案并写清取舍 → 选择推荐方案形成初稿
  - 写 ADR 固化决策 → 使用 `quality-rubric` 自检 → 输出最终文档并列待确认项
- 非功能需求基线
  - SLO 与错误预算；容量与性能假设
  - 可观测性（日志、指标、链路追踪）
  - 安全（鉴权、权限、审计）；备份与恢复（RPO/RTO）
  - 灰度与回滚
- 参考与校验
  - 参考：`architecture-template.md`、`adr-template.md`、`question-bank.md`、`quality-rubric.md`、`diagram-patterns.md`
  - 校验脚本：`python .claude/skills/system-architect/scripts/validate_architecture.py architecture.md`
- 资产治理对齐
  - 架构产出草稿写入 `.agent/outputs/docs/`；在 `.agent/manifests/` 登记输入/输出/哈希
  - 相关日志写入 `.agent/logs/`，遵循路径安全与脱敏规范

## 关键架构原则

- 规范驱动：所有开发必须从文档化的规格开始
- 聚焦 MVP：通过 MVP 定义进行特性规划与任务拆分
- 必要验证：所有任务需通过自动化闸门后再进行人工批准
- 基于技能：优先使用专用技能而非通用开发方式
- 双语支持：文档与部分技能描述为中英双语，团队具备中文背景

## 当前状态

仓库处于早期搭建阶段，具有以下特征：
- `docs/` 目录为空
- 完整的 Claude Code 配置，随时可用于开发
- 技能生态覆盖常见开发场景
- 尚未实现主应用代码
- 已准备好执行规范驱动的开发工作流

## 后续开发步骤

1. 使用 `project-architect` 技能工作流初始化项目
2. 按照 P 序列格式定义 MVP 规格
3. 针对具体开发任务选择合适的斜杠命令
4. 所有实现工作遵循验证闸门流程
5. 充分复用现有技能以覆盖常见开发模式与能力
