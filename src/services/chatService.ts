/**
 * Chat Service
 * 智谱AI对话服务 - 提供简单的对话接口
 *
 * 主要功能：
 * - 简单对话：单轮对话
 * - 带提示词的内容处理：根据txt内容，加入提示词进行处理
 * - 思考模式：支持GLM-4.7的思考能力
 */

import { zhipuChat, type ChatOptions } from '../config/zhipu.js';
import type { ChatRequest, ChatWithContentRequest, ChatResponse } from '../types/index.js';

/**
 * 过滤掉 undefined 值的选项对象
 */
function filterOptions<T extends Record<string, unknown>>(obj: T): Partial<{ [K in keyof T]: NonNullable<T[K]> }> {
  const result: Partial<{ [K in keyof T]: NonNullable<T[K]> }> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      (result as any)[key] = obj[key];
    }
  }
  return result;
}

/**
 * ChatService - 对话服务类
 */
export class ChatService {
  private initialized = false;

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      // 检查 Zhipu AI 是否可用
      const { isAvailable } = await import('../config/zhipu.js');
      if (!isAvailable()) {
        console.warn('WARNING: Zhipu AI is not available. Please set ZHIPU_API_KEY environment variable.');
      }
      this.initialized = true;
    }
  }

  /**
   * 简单对话 - 单轮对话
   * @param request 聊天请求
   * @returns 聊天响应
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    await this.ensureInitialized();

    if (!request.content?.trim()) {
      throw new Error('Content is required');
    }

    const options: ChatOptions = filterOptions({
      model: request.model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      thinking_enabled: request.thinking_enabled,
    });

    // 如果有系统提示词，使用 chatWithPrompt
    if (request.system_prompt?.trim()) {
      const response = await zhipuChat.chatWithPrompt(
        request.content,
        request.system_prompt,
        options
      );
      return this.toChatResponse(response);
    }

    // 否则使用简单对话
    const response = await zhipuChat.chat(request.content, options);
    return this.toChatResponse(response);
  }

  /**
   * 带内容处理的对话
   * 根据txt内容，加入提示词进行处理
   * @param request 内容处理请求
   * @returns 聊天响应
   */
  async chatWithContent(request: ChatWithContentRequest): Promise<ChatResponse> {
    await this.ensureInitialized();

    if (!request.txt_content?.trim()) {
      throw new Error('txt_content is required');
    }
    if (!request.system_prompt?.trim()) {
      throw new Error('system_prompt is required');
    }

    const options: ChatOptions = filterOptions({
      model: request.model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      thinking_enabled: request.thinking_enabled,
    });

    const response = await zhipuChat.chatWithPrompt(
      request.txt_content,
      request.system_prompt,
      options
    );

    return this.toChatResponse(response);
  }

  /**
   * 转换为标准的 ChatResponse 格式
   */
  private toChatResponse(response: Awaited<ReturnType<typeof zhipuChat.sendMessage>>): ChatResponse {
    const result: ChatResponse = {
      content: response.content,
      model: response.model,
      usage: response.usage,
    };

    // 只在有值时添加 reasoning_content
    if (response.reasoning_content) {
      result.reasoning_content = response.reasoning_content;
    }

    return result;
  }

  /**
   * 确保服务已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// 导出单例实例
export const chatService = new ChatService();
