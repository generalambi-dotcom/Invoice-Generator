import { ParsedInvoiceData } from '../whatsapp-nlp';

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'qwen';

export interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
    model: string;
}

export interface LLMResponse {
    success: boolean;
    data?: ParsedInvoiceData;
    error?: string;
    rawResponse?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface VerificationResult {
    success: boolean;
    message: string;
    model?: string;
}

export const SUPPORTED_MODELS: Record<LLMProvider, string[]> = {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
};

export const PROVIDER_LABELS: Record<LLMProvider, string> = {
    openai: 'OpenAI (ChatGPT)',
    anthropic: 'Anthropic (Claude)',
    gemini: 'Google Gemini',
    deepseek: 'DeepSeek',
    qwen: 'Alibaba Qwen',
};
