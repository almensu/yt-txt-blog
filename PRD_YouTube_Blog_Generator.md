# YouTube播客转博客生成器 - 产品需求文档 (PRD)

## 1. 项目概述

### 1.1 产品愿景
构建一个本地化工具，能够从YouTube播客访谈中提取灵感，通过多步骤处理流程，生成高质量的博客文章，支持多种写作风格和发布平台。

### 1.2 核心价值
- **自动化内容创作**：将播客内容转化为结构化博客文章
- **风格灵活性**：支持多种写作风格和发布平台格式
- **本地优先**：所有数据处理本地完成，保障隐私安全
- **模块化设计**：沙盒化处理，支持灵活调整和优化

### 1.3 目标用户
- **业余作家**：需要从播客中获取创作灵感的个人内容创作者
- **内容运营**：需要批量处理播客内容的专业内容团队
- **知识工作者**：希望将学习内容整理成结构化文档的专业人士

## 2. 用户故事

### 2.1 主要用户场景

**用户故事1：单篇文章创作**
> 作为业余作家，我希望能够输入YouTube播客链接，选择WSJ写作风格，生成一篇适合个人博客发布的文章，这样我可以快速将播客洞察转化为高质量内容。

**用户故事2：批量内容处理**
> 作为内容运营，我希望能够批量处理多个播客视频，使用不同的写作风格和平台模板，生成系列文章，这样可以高效地创建内容矩阵。

**用户故事3：风格灵活切换**
> 作为内容创作者，我希望能够基于同一份播客字幕，尝试不同的写作风格（钻石结构、Medium风格等），选择最适合的版本进行发布，这样可以最大化内容价值。

**用户故事4：版本管理**
> 作为专业作者，我希望能够保存不同版本的生成结果，对比优化，并能够回溯到历史版本，这样可以持续改进文章质量。

## 3. 功能需求

### 3.1 核心功能模块

#### 3.1.1 YouTube内容获取模块
- **输入方式支持**：
  - YouTube视频链接
  - 视频ID
  - 批量列表文件（*.txt格式）
- **字幕获取优先级**：
  1. 人工字幕（最高优先级）
  2. 自动生成字幕（备选方案）
  3. 多语言字幕支持（英文优先，中文其次）
- **元数据提取**：
  - 视频标题、描述、发布时间
  - 播主信息、播放量、点赞数
  - 视频时长、分类标签

#### 3.1.2 字幕处理模块
- **格式支持**：
  - JSON3字幕格式解析（优化内存加载）
  - VTT/SRT格式兼容支持
- **文本清洗功能**：
  - 移除时间戳和格式标记
  - 过滤重复内容和噪声
  - 保留语义完整性和上下文关联
- **长内容处理**：
  - **分层分块策略**：支持4小时+播客的智能分块
  - **上下文保持**：200K tokens限制下的细节保留机制
  - **渐进式处理**：流式处理避免内存溢出

#### 3.1.3 智能分块与上下文管理模块
- **分块策略**：
  - **语义分块**：基于话题转换的自然分界点
  - **重叠窗口**：块间重叠确保上下文连续性
  - **动态调整**：根据内容密度调整分块大小（30K-80K tokens）
- **上下文保持**：
  - **全局摘要**：为每个分块提供整体上下文摘要
  - **关键信息锚定**：重要人物、概念、时间线在所有分块中保持一致
  - **引用链管理**：跨分块的引用关系追踪
- **细节保留机制**：
  - **重要性评分**：AI评估每个内容片段的重要性
  - **分层处理**：核心内容详细处理，辅助内容概括处理
  - **重建验证**：分块处理后重建完整性验证

#### 3.1.4 写作风格引擎
- **内置风格库**：
  - **新闻类**：WSJ风格、NYT风格、经济学人风格
  - **故事类**：钻石结构、英雄之旅、问题-解决方案
  - **创作类**：Medium风格、Substack风格、公众号风格
  - **分析类**：哈佛商业评论、TED演讲风格
- **风格配置系统**：
  - MD文件模板系统（如：wsj-style.md）
  - 可自定义风格提示词
  - 风格参数调节（正式程度、篇幅长度等）

#### 3.1.5 平台适配模块
- **支持平台**：
  - 个人博客（Markdown格式）
  - 微信公众号（富文本格式）
  - 微博（纯文字+字数限制）
  - 小红书（封面图+简洁文字）
- **平台特性适配**：
  - 格式规范（段落长度、标点使用）
  - 内容长度限制
  - 媒体元素要求（封面尺寸、图片格式）
  - 话题标签和SEO优化

### 3.2 工作流程管理

#### 3.2.1 标准处理流程
```
YouTube链接 → 字幕获取 → 文本清洗 → 风格转换 → 平台适配 → 生成结果
```

#### 3.2.2 灵活处理模式
- **单步执行**：每次执行一个处理步骤
- **流水线处理**：自动完成所有步骤
- **中间结果复用**：保存中间处理结果，支持不同风格生成
- **人工干预点**：在关键步骤支持人工审核和调整

### 3.3 数据管理

#### 3.3.1 本地存储结构
```
project_data/
├── raw_subtitles/          # 原始字幕文件
├── cleaned_texts/          # 清洗后的纯文本
├── styled_articles/        # 风格化文章
├── platform_outputs/      # 平台适配结果
├── configs/               # 配置文件
│   ├── writing_styles/    # 写作风格配置
│   └── platforms/         # 平台配置
└── versions/              # 版本管理
```

#### 3.3.2 版本控制系统
- **自动版本创建**：每次生成自动创建版本
- **版本对比**：支持不同版本间内容对比
- **版本回滚**：支持回退到历史版本
- **版本标签**：支持为版本添加描述标签

## 4. 技术架构

### 4.1 核心技术挑战：4小时JSON3内容处理

#### 4.1.1 技术挑战分析
**数据规模挑战**：
- 4小时播客 ≈ 240分钟 × 150字/分钟 ≈ 36,000字 ≈ 50,000 tokens (原始字幕)
- JSON3格式包含额外元数据，实际数据量 ≈ 80,000-100,000 tokens
- AI风格转换需要上下文，单次处理限制在200K tokens以内

**细节保持挑战**：
- 播客中的关键洞察、人物观点、数据细节不能丢失
- 话题转换、逻辑关系需要保持完整
- 时间线和因果关系必须准确

#### 4.1.2 解决方案架构：智能分块 + 上下文保持

**核心技术思路**：
1. **分层分块**：不是简单按长度分割，而是基于语义边界
2. **上下文注入**：每个分块都携带必要的上下文信息
3. **智能合并**：处理后的分块通过算法智能合并，保证连贯性
4. **质量验证**：自动检测丢失的细节和不一致之处

### 4.2 沙盒化模块设计

#### 4.2.1 核心沙盒模块
```
src/
├── extractors/           # 内容提取沙盒
│   ├── youtube_extractor.py
│   └── subtitle_parser.py
├── processors/           # 文本处理沙盒
│   ├── text_cleaner.py
│   ├── chunk_manager.py      # 智能分块管理
│   ├── context_preserver.py  # 上下文保持
│   └── content_analyzer.py
├── stylers/             # 写作风格沙盒
│   ├── style_engine.py
│   ├── template_loader.py
│   └── chunk_stitcher.py     # 分块内容合并
├── adapters/            # 平台适配沙盒
│   ├── platform_adapter.py
│   └── format_converter.py
└── managers/            # 流程管理沙盒
    ├── workflow_manager.py
    └── version_manager.py
```

#### 4.2.2 长内容处理核心算法

**智能分块算法**：
```python
class IntelligentChunker:
    def __init__(self, max_tokens=50000, overlap_tokens=2000):
        self.max_tokens = max_tokens
        self.overlap_tokens = overlap_tokens
        self.topic_detector = TopicBoundaryDetector()
        self.importance_scorer = ContentImportanceScorer()

    def chunk_content(self, content: str, metadata: dict) -> List[ContentChunk]:
        """
        核心分块算法，确保细节不丢失
        """
        # 1. 预处理：识别语义边界
        semantic_boundaries = self.topic_detector.detect_boundaries(content)

        # 2. 重要性评分：标记关键内容
        importance_scores = self.importance_scorer.score_content(content)

        # 3. 自适应分块：基于语义和重要性
        chunks = self._create_adaptive_chunks(
            content, semantic_boundaries, importance_scores
        )

        # 4. 重叠窗口：确保上下文连续性
        chunks = self._add_overlap_windows(chunks)

        return chunks

class ContextPreserver:
    def __init__(self):
        self.global_summarizer = GlobalContextSummarizer()
        self.entity_tracker = EntityConsistencyTracker()
        self.timeline_manager = TimelineManager()

    def preserve_context_across_chunks(self, chunks: List[ContentChunk]) -> List[ContextualizedChunk]:
        """
        为每个分块添加必要的上下文信息
        """
        # 1. 生成全局摘要（2000-3000 tokens）
        global_summary = self.global_summarizer.create_summary(chunks)

        # 2. 提取关键实体和关系
        key_entities = self.entity_tracker.extract_entities(chunks)

        # 3. 建立时间线脉络
        timeline = self.timeline_manager.build_timeline(chunks)

        # 4. 为每个分块添加上下文
        contextualized_chunks = []
        for chunk in chunks:
            context = self._create_chunk_context(
                chunk, global_summary, key_entities, timeline
            )
            contextualized_chunks.append(
                ContextualizedChunk(content=chunk, context=context)
            )

        return contextualized_chunks
```

#### 4.2.3 分块处理工作流

**处理流程设计**：
```python
class LongContentWorkflow:
    def process_4hour_content(self, video_id: str) -> ProcessedContent:
        """
        4小时内容处理的核心工作流
        """

        # Phase 1: 提取和预处理 (15-20分钟)
        raw_subtitles = self.extractor.get_json3_subtitles(video_id)
        cleaned_content = self.cleaner.clean_text(raw_subtitles)

        # Phase 2: 智能分块 (5-10分钟)
        chunks = self.chunker.chunk_content(cleaned_content)
        contextualized_chunks = self.context_preserver.preserve_context(chunks)

        # Phase 3: 并行处理 (20-30分钟)
        processed_chunks = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            # 为每个分块分配处理任务
            future_to_chunk = {
                executor.submit(self.process_chunk, chunk): chunk
                for chunk in contextualized_chunks
            }

            for future in concurrent.futures.as_completed(future_to_chunk):
                chunk_result = future.result()
                processed_chunks.append(chunk_result)

        # Phase 4: 智能合并 (5-10分钟)
        final_content = self.chunk_stitcher.stitch_chunks(processed_chunks)

        # Phase 5: 质量验证 (5分钟)
        quality_score = self.quality_validator.validate(final_content, original_content)

        return ProcessedContent(
            content=final_content,
            chunks=processed_chunks,
            quality_score=quality_score,
            processing_metadata=self._collect_metadata()
        )
```

#### 4.2.4 分块处理数据结构

**分块处理数据结构**：
```python
class ContentChunk:
    chunk_id: str
    sequence_number: int
    content: str
    token_count: int
    semantic_boundaries: List[int]
    importance_score: float
    entities: List[str]
    timestamp_range: Tuple[float, float]
    overlap_with_previous: int
    overlap_with_next: int

class ContextualizedChunk:
    chunk: ContentChunk
    context: ChunkContext

class ChunkContext:
    global_summary: str              # 全局摘要 (2000-3000 tokens)
    key_entities: Dict[str, str]     # 关键实体及关系
    timeline_position: str           # 在整体时间线中的位置
    previous_chunk_summary: str      # 前一块摘要
    next_chunk_preview: str          # 后一块预览
    topic_transitions: List[str]     # 话题转换点
    importance_markers: List[str]    # 重要性标记

class ProcessedChunk:
    original_chunk: ContextualizedChunk
    processed_content: str
    style_applied: str
    quality_metrics: Dict[str, float]
    processing_metadata: Dict[str, Any]

class ChunkStitchResult:
    final_content: str
    chunk_boundaries: List[int]
    quality_score: float
    lost_details: List[str]          # 潜在丢失的细节
    consistency_issues: List[str]    # 一致性问题
    stitching_metadata: Dict[str, Any]
```

**标准化模块接口**：
```python
class ModuleInput:
    task_id: str
    operation: str                   # 'chunk', 'process', 'stitch', etc.
    data: Union[ContentChunk, List[ContentChunk], ProcessedContent]
    config: dict
    metadata: dict

class ModuleOutput:
    task_id: str
    success: bool
    data: Union[List[ContentChunk], ProcessedChunk, ChunkStitchResult]
    error_message: Optional[str]
    processing_time: float
    tokens_used: int
    metadata: dict
```

**错误处理规范**：
- 统一错误码体系（1000-1999: 网络错误, 2000-2999: 数据错误, 3000-3999: 处理错误）
- 结构化日志记录（JSON格式，包含task_id, timestamp, level, message）
- 错误重试机制（指数退避，最大重试3次）

**模块独立性**：
- 每个模块可独立运行和单元测试
- 模块间通过标准化接口通信
- 支持模块的热插拔和版本管理

### 4.2 数据流程架构

#### 4.2.1 数据流设计
```python
# 详细数据结构定义
class DataPacket:
    # 基础信息
    task_id: str                    # 唯一任务标识符
    video_id: str                   # YouTube视频ID格式: [a-zA-Z0-9_-]{11}
    created_at: datetime           # 创建时间戳

    # 原始数据
    raw_content: dict               # 原始字幕和元数据
    raw_content.video_info: dict    # {title, description, duration, channel}
    raw_content.subtitles: list     # [{start, end, text, language}]
    raw_content.thumbnail_url: str  # 封面图片URL

    # 处理后数据
    processed_content: str          # 清洗后的纯文本（无时间戳）
    processed_content.word_count: int # 字数统计
    processed_content.language: str # 检测到的主要语言

    # 风格化内容
    styled_content: dict            # 不同风格的文章内容
    styled_content.wsj: str        # WSJ风格文章
    styled_content.diamond: str     # 钻石结构文章
    styled_content.medium: str      # Medium风格文章

    # 格式化输出
    formatted_output: dict          # 平台适配后的最终输出
    formatted_output.blog: dict     # {title, content, metadata, seo}
    formatted_output.wechat: dict   # {title, content, images, tags}
    formatted_output.weibo: dict    # {content, hashtags, length}

    # 元数据
    metadata: dict                  # 处理过程元数据
    metadata.processing_steps: list # 已完成的处理步骤
    metadata.quality_score: float   # 内容质量评分 (0-1)
    metadata.word_count_by_style: dict # 各风格字数统计

    # 版本控制
    version: str                   # 结果版本号 (v1.0, v1.1, etc.)
    parent_version: Optional[str]   # 父版本号（用于版本追踪）
    change_description: str        # 版本变更描述
```

#### 4.2.2 处理管道
- **并行处理**：支持多个视频并行处理
- **断点续传**：支持从任意中间步骤继续处理
- **结果缓存**：缓存处理结果，避免重复计算

### 4.3 配置系统架构

#### 4.3.1 配置文件结构

**配置文件层次**：
```yaml
configs/
├── app_config.yaml          # 应用全局配置
├── youtube_config.yaml      # YouTube API配置
├── processing_config.yaml   # 处理参数配置
├── ai_models_config.yaml    # AI模型配置
├── writing_styles/          # 写作风格配置
│   ├── wsj_style.md
│   ├── diamond_structure.md
│   ├── medium_style.md
│   └── custom_style_template.md
└── platforms/              # 平台适配配置
    ├── personal_blog.md
    ├── wechat_official.md
    ├── weibo.md
    └── xiaohongshu.md
```

**详细配置示例**：
```yaml
# app_config.yaml 示例
app:
  name: "YouTube Blog Generator"
  version: "1.0.0"
  log_level: "INFO"
  max_concurrent_tasks: 3
  cache_enabled: true
  cache_ttl: 3600

performance:
  memory_limit_mb: 8192
  processing_timeout_minutes: 30
  chunk_size_tokens: 50000

storage:
  base_path: "./project_data"
  backup_enabled: true
  backup_retention_days: 30

# youtube_config.yaml 示例
api:
  youtube_api_key: "${YOUTUBE_API_KEY}"
  request_timeout: 30
  max_retries: 3
  rate_limit_per_minute: 60

subtitle:
  preferred_languages: ["en", "zh"]
  fallback_to_auto: true
  min_confidence_score: 0.8

# ai_models_config.yaml 示例
models:
  primary:
    provider: "openai"  # openai, anthropic, local
    model: "gpt-4-turbo"
    max_tokens: 128000
    temperature: 0.7

  backup:
    provider: "anthropic"
    model: "claude-3-sonnet"
    max_tokens: 200000
    temperature: 0.5

cost_control:
  daily_token_limit: 1000000
  cost_alert_threshold: 0.8
```

**写作风格配置格式**：
```markdown
# wsj_style.md 示例
---
style_name: "Wall Street Journal"
formality_level: 8  # 1-10, 10为最正式
target_audience: "business_professionals"
average_sentence_length: 25
paragraph_max_sentences: 5

tone_characteristics:
  - professional
  - analytical
  - data_driven
  - authoritative

structure_rules:
  - start_with_hook: true
  - include_statistics: true
  - expert_quotes: true
  - conclusion_framework: "call_to_action"
---

# 写作指导
作为《华尔街日报》的资深记者，请根据以下播客内容撰写一篇专业商业分析文章。

## 文章结构要求：
1. **标题**：突出核心洞察，使用数据驱动标题
2. **导语**：3-4句话概括核心观点和重要性
3. **主体**：
   - 背景介绍（2-3段）
   - 关键数据和分析（3-4段）
   - 专家观点和引用（2-3段）
   - 影响分析（2-3段）
4. **结论**：总结观点并提出行动建议

## 写作风格要求：
- 使用专业术语，但避免过度学术化
- 每个观点都要有数据或事实支撑
- 保持客观、中立的语调
- 段落长度控制在150-200字
- 避免感叹句和情感化表达

## 内容处理指南：
请基于以下播客内容，提取关键商业洞察，并按照上述要求撰写文章：
[播客内容将在这里插入]
```

#### 4.3.2 动态配置加载
- **热重载**：支持运行时重新加载配置
- **配置验证**：启动时验证配置文件格式
- **默认配置**：提供开箱即用的默认配置

## 5. 非功能性需求

### 5.1 性能要求（基于技术优化调整）
- **处理速度**：
  - 1小时播客内容：8-12分钟
  - 4小时播客内容：30-45分钟
  - 包含AI风格转换和网络延迟
- **内存使用**：
  - 基础运行：2-4GB
  - 处理4小时播客：12-16GB（流式处理优化后）
  - 峰值内存：16GB
- **并发能力**：
  - 同时处理视频数：2个（优化后的现实目标）
  - 分块并行处理：最多3个分块同时处理
- **启动时间**：应用启动时间 < 15秒
- **分块处理性能**：
  - 单个分块处理：2-5分钟（50K tokens以内）
  - 分块间切换：< 30秒

### 5.2 可靠性要求
- **错误恢复**：网络中断后自动重试
- **数据完整性**：处理过程中数据不丢失
- **优雅降级**：字幕获取失败时提供备选方案
- **日志记录**：完整的操作日志和错误追踪

### 5.3 可用性要求
- **命令行界面**：清晰的CLI命令和帮助信息
- **进度显示**：长时间处理时显示进度条
- **错误提示**：友好的错误信息和解决建议
- **配置文档**：详细的配置说明和示例

### 5.4 可维护性要求
- **模块化设计**：高内聚、低耦合的模块设计
- **代码规范**：遵循Python PEP8编码规范
- **单元测试**：核心模块单元测试覆盖率 > 80%
- **文档完整**：完整的API文档和用户手册

## 6. 实施计划

### 6.1 开发优先级（基于技术难点调整）

#### Phase 1：核心技术突破（3周）
- [ ] **智能分块算法实现** - 解决4小时内容处理的核心技术
- [ ] **上下文保持系统** - 确保细节不丢失的关键机制
- [ ] **JSON3字幕解析优化** - 内存友好的大文件处理
- [ ] **流式处理基础框架** - 避免内存溢出的基础设施
- [ ] **基础质量验证系统** - 检测细节丢失的自动化

#### Phase 2：核心功能MVP（3周）
- [ ] YouTube内容获取（包含错误恢复）
- [ ] 基础文本清洗和预处理
- [ ] 简单风格转换（WSJ风格，基于分块）
- [ ] 个人博客格式输出
- [ ] 基础版本管理功能

#### Phase 3：风格扩展（2周）
- [ ] 多种写作风格支持（钻石结构、Medium等）
- [ ] 分块内容智能合并算法
- [ ] 配置文件系统（MD风格模板）
- [ ] 高级版本管理（分块级别版本控制）

#### Phase 4：平台适配（2周）
- [ ] 多平台格式支持（公众号、微博、小红书）
- [ ] 平台特性配置系统
- [ ] 批量处理功能（基于分块并行）
- [ ] 成本管理和token预算控制

#### Phase 5：优化增强（2周）
- [ ] 性能优化（并行处理、缓存机制）
- [ ] 错误处理完善（分块级别的错误恢复）
- [ ] 用户界面改进（进度显示、分块状态）
- [ ] 文档和测试完善（分块算法测试用例）

### 6.2 技术里程碑

**里程碑1：基础框架（2周）**
- 沙盒架构搭建
- YouTube API集成
- 基础数据流实现

**里程碑2：核心功能（3周）**
- 字幕处理完成
- 基础风格转换实现
- 版本管理v1.0

**里程碑3：风格系统（2周）**
- 多风格支持完成
- 配置系统实现
- 平台适配基础版

**里程碑4：产品完善（2周）**
- 全面测试和优化
- 文档编写
- 发布准备

### 6.3 风险评估

#### 技术风险
- **YouTube API限制**：需要实现请求频率控制和备选方案
- **长内容处理**：200K tokens上下文处理需要优化内存使用
- **字幕质量**：自动生成字幕质量不稳定，需要增强文本清洗能力

#### 产品风险
- **用户接受度**：需要通过用户测试验证产品价值
- **风格适配**：不同写作风格的质量需要持续优化
- **平台变化**：各大平台格式要求可能变化，需要持续维护

#### 缓解策略
- **API限制**：实现多账号轮换和请求缓存
- **长内容**：采用分段处理和流式处理技术
- **字幕质量**：结合多种清洗算法和人工校验机制
- **平台变化**：建立平台配置更新机制和用户反馈渠道

## 7. 验收标准

### 7.1 功能验收
- [ ] 成功处理90%以上的YouTube播客链接
- [ ] 生成的文章符合选定写作风格特征
- [ ] 输出格式符合目标平台要求
- [ ] 版本管理功能正常工作

### 7.2 性能验收
- [ ] 单小时播客处理时间 < 5分钟
- [ ] 内存使用保持在合理范围
- [ ] 并发处理不影响性能

### 7.3 质量验收
- [ ] 代码测试覆盖率 > 80%
- [ ] 文档完整且准确
- [ ] 错误处理机制完善
- [ ] 用户界面友好直观

---

**文档版本**: v1.0
**创建日期**: 2025-12-19
**最后更新**: 2025-12-19
**负责人**: 产品团队