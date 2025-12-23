"""
配置模块

提供默认配置和语言特定规则
"""

from .settings import (
    DEFAULT_CLEANING_CONFIG,
    DEFAULT_FORMATTING_CONFIG,
    PROCESSING_DEFAULTS,
    OUTPUT_FORMATS
)
from .language_rules import LanguageRules, get_language_rules

__all__ = [
    'DEFAULT_CLEANING_CONFIG',
    'DEFAULT_FORMATTING_CONFIG',
    'PROCESSING_DEFAULTS',
    'OUTPUT_FORMATS',
    'LanguageRules',
    'get_language_rules'
]