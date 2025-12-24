/**
 * Chat Routes
 * 智谱AI对话API路由
 *
 * 提供以下端点：
 * - POST /api/chat - 简单对话
 * - POST /api/chat/content - 带内容处理的对话
 */

import { Router } from 'express';
import { chatService } from '../services/chatService.js';
import type { ChatRequest, ChatWithContentRequest } from '../types/index.js';

const router = Router();

/**
 * POST /api/chat
 * 简单对话 - 单轮对话
 *
 * 请求体:
 * {
 *   "content": "你好，请介绍一下自己",
 *   "system_prompt": "你是一个有用的AI助手", // 可选
 *   "model": "glm-4.7", // 可选
 *   "temperature": 0.7, // 可选
 *   "thinking_enabled": false // 可选
 * }
 */
router.post('/', async (req, res) => {
  try {
    const data: ChatRequest = req.body;
    const response = await chatService.chat(data);
    res.status(200).json(response);
  } catch (error) {
    const errorMessage = (error as Error).message;
    const statusCode = errorMessage.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      error: 'Chat failed',
      message: errorMessage,
    });
  }
});

/**
 * POST /api/chat/content
 * 带内容处理的对话 - 根据txt内容，加入提示词进行处理
 *
 * 请求体:
 * {
 *   "txt_content": "这是你的原始文本内容...",
 *   "system_prompt": "请将以下内容改写成博客文章风格",
 *   "model": "glm-4.7", // 可选
 *   "temperature": 0.7, // 可选
 *   "thinking_enabled": false // 可选
 * }
 */
router.post('/content', async (req, res) => {
  try {
    const data: ChatWithContentRequest = req.body;
    const response = await chatService.chatWithContent(data);
    res.status(200).json(response);
  } catch (error) {
    const errorMessage = (error as Error).message;
    const statusCode = errorMessage.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      error: 'Chat with content failed',
      message: errorMessage,
    });
  }
});

export default router;
