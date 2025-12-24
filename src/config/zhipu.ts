import OpenAI from 'openai';

/**
 * Zhipu AI Configuration
 * 使用 OpenAI SDK 与智谱AI API 兼容接口
 *
 * 文档参考: docs/OpenAI-API-Compatibility-for-zhipu.md
 */

// ============================================================================
// 环境变量配置
// ============================================================================

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
// 标准端点
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
// Coding端点 (GLM编码套餐专属)
const ZHIPU_CODING_API_BASE = 'https://open.bigmodel.cn/api/coding/paas/v4';

// 使用coding端点(如果配置了ZHIPU_USE_CODING=true)
const USE_CODING_ENDPOINT = process.env.ZHIPU_USE_CODING === 'true';
const API_BASE = USE_CODING_ENDPOINT ? ZHIPU_CODING_API_BASE : ZHIPU_API_BASE;

if (!ZHIPU_API_KEY) {
  console.warn('WARNING: ZHIPU_API_KEY not set in environment variables');
}

// 输出使用的端点
console.log(`Zhipu AI using endpoint: ${API_BASE}${USE_CODING_ENDPOINT ? ' (Coding套餐)' : ''}`);

// ============================================================================
// 客户端初始化
// ============================================================================

/**
 * 智谱AI OpenAI 兼容客户端
 */
export const zhipuClient = new OpenAI({
  apiKey: ZHIPU_API_KEY,
  baseURL: API_BASE,
});

// ============================================================================
// 模型配置
// ============================================================================

/** 智谱AI 可用模型列表 */
export const ZHIPU_MODELS = {
  /** GLM-4.7 - 最强模型，支持思考模式 */
  GLM_4_7: 'glm-4.7',
  /** GLM-4.6 */
  GLM_4_6: 'glm-4.6',
  /** GLM-4 - 强大的通用模型 */
  GLM_4: 'glm-4',
  /** GLM-4-Flash - 快速响应模型 */
  GLM_4_FLASH: 'glm-4-flash',
  /** GLM-4V - 视觉理解模型 */
  GLM_4V: 'glm-4v',
  /** GLM-4-Air - 经济实惠模型 */
  GLM_4_AIR: 'glm-4-air',
} as const;

/** 默认模型配置 */
export const DEFAULT_MODEL = process.env.ZHIPU_MODEL || ZHIPU_MODELS.GLM_4_7;
/** 最大 max_tokens 配置 (glm-4.7 / glm-4.6 最大支持 131072) */
export const DEFAULT_MAX_TOKENS = parseInt(process.env.ZHIPU_MAX_TOKENS || '131072', 10);
export const DEFAULT_TEMPERATURE = parseFloat(process.env.ZHIPU_TEMPERATURE || '0.7');

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 聊天消息类型
 */
export type ChatMessageRole = 'system' | 'user' | 'assistant';

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

/**
 * 流式响应块
 */
export interface StreamChunk {
  delta: string;
  reasoning_content?: string;
  done: boolean;
}

/**
 * 聊天完成响应
 */
export interface ChatCompletionResponse {
  content: string;
  model: string;
  reasoning_content?: string; // 思考模式内容
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 聊天请求选项
 */
export interface ChatOptions {
  /** 模型名称 */
  model?: string;
  /** 最大输出 token 数 */
  max_tokens?: number;
  /** 温度参数 (0-1) */
  temperature?: number;
  /** Top-P 采样参数 (0-1) */
  top_p?: number;
  /** 是否启用思考模式 (仅 glm-4.7 支持) */
  thinking_enabled?: boolean;
  /** 是否使用流式输出 */
  stream?: boolean;
}

// ============================================================================
// 对话模型服务类
// ============================================================================

/**
 * ZhipuChatService - 智谱AI对话模型服务
 *
 * 使用示例:
 * ```typescript
 * // 简单对话
 * const response = await zhipuChat.chat('你好，请介绍一下自己');
 *
 * // 带提示词的内容处理
 * const response = await zhipuChat.chatWithPrompt(
 *   '你的txt内容',
 *   '请将以下内容改写成博客文章风格'
 * );
 *
 * // 思考模式 (复杂推理)
 * const response = await zhipuChat.chat('解释量子力学原理', {
 *   thinking_enabled: true
 * });
 * ```
 */
export class ZhipuChatService {
  private client: OpenAI;
  private defaultModel: string;

  constructor(client: OpenAI = zhipuClient, defaultModel: string = DEFAULT_MODEL) {
    this.client = client;
    this.defaultModel = defaultModel;
  }

  /**
   * 简单对话 - 单轮对话
   * @param content 用户输入内容
   * @param options 可选参数
   */
  async chat(content: string, options: ChatOptions = {}): Promise<ChatCompletionResponse> {
    return this.sendMessage([{ role: 'user', content }], options);
  }

  /**
   * 带提示词的内容处理
   * 适用于：根据txt内容，加入提示词进行处理
   *
   * @param txtContent 要处理的文本内容
   * @param systemPrompt 系统提示词
   * @param options 可选参数
   */
  async chatWithPrompt(
    txtContent: string,
    systemPrompt: string,
    options: ChatOptions = {}
  ): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: txtContent },
    ];
    return this.sendMessage(messages, options);
  }

  /**
   * 多轮对话
   * @param messages 对话历史消息数组
   * @param options 可选参数
   */
  async sendMessage(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatCompletionResponse> {
    const model = options.model || this.defaultModel;

    // 构建 OpenAI 格式的请求参数
    const requestBody: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      top_p: options.top_p ?? null,
    };

    // 添加思考模式参数 (智谱AI 特有)
    if (options.thinking_enabled) {
      (requestBody as any).thinking = { type: 'enabled' };
    }

    const response = await this.client.chat.completions.create(requestBody);

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      reasoning_content: (response.choices[0]?.message as any)?.reasoning_content,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  /**
   * 流式对话
   * @param content 用户输入内容
   * @param onChunk 接收流式内容的回调函数
   * @param options 可选参数
   */
  async chatStream(
    content: string,
    onChunk: (chunk: StreamChunk) => void,
    options: ChatOptions = {}
  ): Promise<void> {
    const model = options.model || this.defaultModel;

    const requestBody: OpenAI.ChatCompletionCreateParamsStreaming = {
      model,
      messages: [{ role: 'user', content }],
      max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      top_p: options.top_p ?? null,
      stream: true,
    } as OpenAI.ChatCompletionCreateParamsStreaming;

    // 添加思考模式参数
    if (options.thinking_enabled) {
      (requestBody as any).thinking = { type: 'enabled' };
    }

    const stream = await this.client.chat.completions.create(requestBody);

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      onChunk({
        delta: delta?.content || '',
        reasoning_content: (delta as any)?.reasoning_content,
        done: chunk.choices[0]?.finish_reason !== null,
      });
    }
  }

  /**
   * 带提示词的流式处理
   * @param txtContent 要处理的文本内容
   * @param systemPrompt 系统提示词
   * @param onChunk 接收流式内容的回调函数
   * @param options 可选参数
   */
  async chatWithPromptStream(
    txtContent: string,
    systemPrompt: string,
    onChunk: (chunk: StreamChunk) => void,
    options: ChatOptions = {}
  ): Promise<void> {
    const model = options.model || this.defaultModel;

    const requestBody: OpenAI.ChatCompletionCreateParamsStreaming = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: txtContent },
      ] as OpenAI.ChatCompletionMessageParam[],
      max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      top_p: options.top_p ?? null,
      stream: true,
    } as OpenAI.ChatCompletionCreateParamsStreaming;

    // 添加思考模式参数
    if (options.thinking_enabled) {
      (requestBody as any).thinking = { type: 'enabled' };
    }

    const stream = await this.client.chat.completions.create(requestBody);

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      onChunk({
        delta: delta?.content || '',
        reasoning_content: (delta as any)?.reasoning_content,
        done: chunk.choices[0]?.finish_reason !== null,
      });
    }
  }
}

// ============================================================================
// 导出单例实例
// ============================================================================

/**
 * 默认的智谱AI对话服务实例
 */
export const zhipuChat = new ZhipuChatService();

/**
 * 获取客户端 (兼容旧代码)
 */
export function getClient(): OpenAI {
  return zhipuClient;
}

/**
 * 检查服务是否可用
 */
export function isAvailable(): boolean {
  return !!ZHIPU_API_KEY;
}
