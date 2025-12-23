# OpenAI SDK for 智谱AI API 完整开发指南

## 📋 目录

- [概述](#概述)
- [核心优势](#核心优势)
- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [基础使用示例](#基础使用示例)
- [高级功能](#高级功能)
- [参数配置](#参数配置)
- [迁移指南](#迁移指南)
- [实践建议](#实践建议)
- [常见问题](#常见问题)

---

## 概述

智谱AI提供与OpenAI API完全兼容的接口，让开发者能够使用现有的OpenAI SDK代码，只需简单修改API密钥和基础URL即可无缝切换到智谱AI的模型服务。

### 🎯 核心优势

- **快速迁移**: 现有OpenAI应用可快速迁移到智谱AI
- **熟悉工具**: 使用熟悉的开发模式和工具链
- **强大能力**: 享受智谱AI模型的强大性能
- **代码一致性**: 保持代码的一致性和可维护性

---

## 环境准备

### 安装 OpenAI SDK

#### 使用 pip 安装

```bash
# 安装或升级到最新版本
pip install --upgrade 'openai>=1.0'

# 验证安装
python -c "import openai; print(openai.__version__)"
```

#### 使用 poetry 安装

```bash
poetry add openai
```

### 获取 API Key

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录您的账户
3. 在 API Keys 管理页面创建 API Key
4. 复制您的 API Key 以供使用

---

## 快速开始

### 创建客户端

```python
from openai import OpenAI

# 创建智谱AI客户端
client = OpenAI(
    api_key="your-zhipuai-api-key",
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)
```

### 环境变量
```
from openai import OpenAI
import os

# 使用环境变量
client = OpenAI(
    api_key=os.getenv("ZAI_API_KEY"),
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)
```

### 配置类
```
from openai import OpenAI
from dataclasses import dataclass

@dataclass
class ZhipuAIConfig:
    api_key: str
    base_url: str = "https://open.bigmodel.cn/api/paas/v4/"
    timeout: int = 30
    max_retries: int = 3

config = ZhipuAIConfig(api_key="your-api-key")
client = OpenAI(
    api_key=config.api_key,
    base_url=config.base_url,
    timeout=config.timeout,
    max_retries=config.max_retries
)
```


---

## 基础使用示例

### 1. 简单对话

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-zhipuai-api-key",
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)

completion = client.chat.completions.create(
    model="glm-4.5",
    messages=[
        {"role": "system", "content": "你是一个聪明且富有创造力的小说作家"},
        {"role": "user", "content": "请你作为童话故事大王，写一篇短篇童话故事"}
    ],
    top_p=0.7,
    temperature=0.9
)

print(completion.choices[0].message.content)
```

### 2. 流式响应

```python
stream = client.chat.completions.create(
    model="glm-4.5",
    messages=[
        {"role": "user", "content": "写一首关于人工智能的诗"}
    ],
    stream=True,
    temperature=0.8
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)

print()  # 换行
```

### 3. 多轮对话

```python
class ChatBot:
    def __init__(self, api_key: str):
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://open.bigmodel.cn/api/paas/v4/"
        )
        self.conversation = [
            {"role": "system", "content": "你是一个有用的AI助手"}
        ]

    def chat(self, user_input: str) -> str:
        # 添加用户消息
        self.conversation.append({"role": "user", "content": user_input})

        # 调用API
        response = self.client.chat.completions.create(
            model="glm-4-air-250414",
            messages=self.conversation,
            temperature=0.7
        )

        # 获取AI回复
        ai_response = response.choices[0].message.content

        # 添加到对话历史
        self.conversation.append({"role": "assistant", "content": ai_response})

        return ai_response

    def clear_history(self):
        """清除对话历史，保留系统提示"""
        self.conversation = self.conversation[:1]

# 使用示例
bot = ChatBot("your-api-key")
print(bot.chat("你好，请介绍一下自己"))
print(bot.chat("你能帮我写代码吗？"))
print(bot.chat("写一个Python的快速排序算法"))
```

---

## 高级功能

### 1. 推理模式（Thinking）

GLM-4.5和GLM-4.5-Air支持思考模式，可解决复杂推理问题：

```python
import os
from openai import OpenAI

client = OpenAI(api_key='your-api-key', base_url='https://open.bigmodel.cn/api/paas/v4')
response = client.chat.completions.create(
    model='glm-4.5',
    messages=[
        {"role": "system", "content": "you are a helpful assistant"},
        {"role": "user", "content": "what is the revolution of llm?"}
    ],
    extra_body={
        "thinking": {
            "type": "enabled",
        },
    }
)

for chunk in response:
    if chunk.choices[0].delta.reasoning_content:
        print(chunk.choices[0].delta.reasoning_content, end='')
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end='')
```

### 2. 函数调用（Function Calling）

```python
import json

def get_weather(location: str) -> str:
    """获取指定地点的天气信息"""
    # 这里应该调用真实的天气API
    return f"{location}的天气：晴天，温度25°C"

# 定义函数描述
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定地点的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "地点名称，例如：北京、上海"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# 调用带函数的对话
response = client.chat.completions.create(
    model="glm-4-air-250414",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    tools=tools,
    tool_choice="auto"
)

# 处理函数调用
message = response.choices[0].message
if message.tool_calls:
    for tool_call in message.tool_calls:
        if tool_call.function.name == "get_weather":
            args = json.loads(tool_call.function.arguments)
            result = get_weather(args["location"])
            print(f"函数调用结果: {result}")
```

### 3. 图像理解

```python
import base64
from PIL import Image
import io

def encode_image(image_path: str) -> str:
    """将图像编码为base64字符串"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# 图像理解示例
image_base64 = encode_image("path/to/your/image.jpg")

response = client.chat.completions.create(
    model="glm-4v",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "请描述这张图片的内容"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}"
                    }
                }
            ]
        }
    ],
    temperature=0.7
)

print(response.choices[0].message.content)
```

---

## 参数配置

### 常用参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| model | string | 必填 | 要使用的模型名称 |
| messages | array | 必填 | 对话消息列表 |
| temperature | float | 0.6 | 控制输出的随机性 (0-1) |
| top_p | float | 0.95 | 核采样参数 (0-1) |
| max_tokens | integer | - | 最大输出token数 |
| stream | boolean | false | 是否使用流式输出 |
| stop | string/array | - | 停止生成的标记 |

### 支持的模型

- **glm-4.5**: 最强性能模型，适合复杂任务
- **glm-4-air-250414**: 平衡性能和成本的主流模型
- **glm-4-flash**: 快速响应的轻量级模型
- **glm-4v**: 视觉理解模型
- **glm-4v-plus**: 增强版视觉理解模型

---

## 迁移指南

### 从OpenAI迁移

如果您已经在使用OpenAI API，迁移到智谱AI非常简单：

```python
# 原来的OpenAI代码
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",  # OpenAI API Key
    # base_url使用默认值
)

# 迁移到智谱AI，只需要修改两个地方
client = OpenAI(
    api_key="your-zhipuai-api-key",  # 替换为智谱AI API Key
    base_url="https://open.bigmodel.cn/api/paas/v4/"  # 添加智谱AI base_url
)

# 其他代码保持不变
response = client.chat.completions.create(
    model="glm-4.5",  # 使用智谱AI模型
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 模型映射

| OpenAI模型 | 智谱AI对应模型 | 说明 |
|------------|----------------|------|
| gpt-4 | glm-4.5 | 最强性能模型 |
| gpt-4-turbo | glm-4-air-250414 | 平衡性能和成本 |
| gpt-3.5-turbo | glm-4-flash | 快速响应模型 |
| gpt-4-vision | glm-4v-plus | 视觉理解模型 |

---

## 实践建议

### 1. 错误处理

```python
from openai import OpenAI
import openai

client = OpenAI(
    api_key="your-zhipuai-api-key",
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)

try:
    response = client.chat.completions.create(
        model="glm-4.5",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
except openai.APIConnectionError as e:
    print(f"API连接错误: {e}")
except openai.RateLimitError as e:
    print(f"请求频率限制: {e}")
except openai.AuthenticationError as e:
    print(f"认证失败: {e}")
except openai.APIError as e:
    print(f"API错误: {e}")
```

### 2. 配置管理

```python
import os
from openai import OpenAI

# 从环境变量读取配置
api_key = os.getenv("ZHIPU_API_KEY")
base_url = os.getenv("ZHIPU_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/")

client = OpenAI(
    api_key=api_key,
    base_url=base_url
)
```

### 3. 重试机制

```python
import time
from openai import OpenAI
import openai

def chat_with_retry(client, messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="glm-4.5",
                messages=messages,
                temperature=0.7
            )
        except openai.RateLimitError:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt  # 指数退避
            time.sleep(wait_time)
        except openai.APIError as e:
            print(f"API错误: {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(1)
```

---

## 更多资源

- [智谱AI开放平台](https://open.bigmodel.cn/)
- [API文档完整版](https://docs.bigmodel.cn/)
- [示例代码库](https://github.com/zhipuai)
- [社区支持](https://github.com/zhipuai/community)

---

## 更新日志

- **2024-12-22**: 初始版本，支持基础对话、流式响应、函数调用、图像理解
- 支持思考模式（thinking）用于复杂推理任务
- 提供完整的迁移指南和实践建议

# 我的 .zshrc
export ZHIPU_API_KEY="your-zhipuai-api-key"