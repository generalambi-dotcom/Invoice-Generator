import { LLMConfig, LLMResponse, VerificationResult } from './types';
import { ParsedInvoiceData } from '../whatsapp-nlp';

const SYSTEM_PROMPT = `
You are an expert invoice parsing assistant.
Extract the following information from the user's message into a JSON object:
- clientName: explicit name or inferred context
- clientEmail: valid email address
- clientPhone: valid phone number
- currency: ISO 3-letter code (default to NGN if unsure but context suggests Nigeria, otherwise USD)
- items: array of objects with description, quantity, rate
- dueDate: YYYY-MM-DD
- taxRate: number (percentage)
- discountRate: number (percentage)
- notes: any additional instructions

Return ONLY the JSON object. No markdown formatting, no explanations.
If specific fields are missing, omit them.
Examples:
"Bill John Doe 500 for web design" -> {"clientName": "John Doe", "items": [{"description": "Web Design", "quantity": 1, "rate": 500}], "currency": "USD"}
`;

export async function verifyLLMConnection(config: LLMConfig): Promise<VerificationResult> {
    try {
        const result = await generateCompletion(config, 'Hello, are you working? Respond with "Yes".', true);
        if (result.success) {
            return { success: true, message: 'Connection successful!', model: config.model };
        }
        return { success: false, message: result.error || 'Connection failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Connection failed' };
    }
}

export async function parseInvoiceWithLLM(config: LLMConfig, message: string): Promise<LLMResponse> {
    return generateCompletion(config, message);
}

async function generateCompletion(config: LLMConfig, prompt: string, isVerification = false): Promise<LLMResponse> {
    switch (config.provider) {
        case 'openai':
            return callOpenAI(config, prompt, isVerification);
        case 'anthropic':
            return callAnthropic(config, prompt, isVerification);
        case 'gemini':
            return callGemini(config, prompt, isVerification);
        case 'deepseek':
            return callDeepSeek(config, prompt, isVerification);
        case 'qwen':
            return callQwen(config, prompt, isVerification);
        default:
            return { success: false, error: 'Unsupported provider' };
    }
}

// OpenAI Implementation
async function callOpenAI(config: LLMConfig, prompt: string, isVerification: boolean): Promise<LLMResponse> {
    try {
        const messages = isVerification
            ? [{ role: 'user', content: prompt }]
            : [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model || 'gpt-4o',
                messages,
                temperature: 0,
                // response_format: isVerification ? undefined : { type: "json_object" } // Safe to use for modern models
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        if (isVerification) return { success: true, rawResponse: content };

        try {
            const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
            return { success: true, data: parsed, rawResponse: content };
        } catch {
            return { success: false, error: 'Failed to parse JSON response from OpenAI', rawResponse: content };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// DeepSeek Implementation (OpenAI Compatible)
async function callDeepSeek(config: LLMConfig, prompt: string, isVerification: boolean): Promise<LLMResponse> {
    try {
        const messages = isVerification
            ? [{ role: 'user', content: prompt }]
            : [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ];

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model || 'deepseek-chat',
                messages,
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'DeepSeek API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        if (isVerification) return { success: true, rawResponse: content };

        try {
            const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
            return { success: true, data: parsed, rawResponse: content };
        } catch {
            return { success: false, error: 'Failed to parse JSON response from DeepSeek', rawResponse: content };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Qwen Implementation (OpenAI Compatible via DashScope)
async function callQwen(config: LLMConfig, prompt: string, isVerification: boolean): Promise<LLMResponse> {
    try {
        const messages = isVerification
            ? [{ role: 'user', content: prompt }]
            : [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ];

        // DashScope compatible-mode endpoint
        const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model || 'qwen-turbo',
                messages,
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || err.message || 'Qwen API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        if (isVerification) return { success: true, rawResponse: content };

        try {
            const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
            return { success: true, data: parsed, rawResponse: content };
        } catch {
            return { success: false, error: 'Failed to parse JSON response from Qwen', rawResponse: content };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Anthropic Implementation
async function callAnthropic(config: LLMConfig, prompt: string, isVerification: boolean): Promise<LLMResponse> {
    try {
        const systemPrompt = isVerification ? undefined : SYSTEM_PROMPT;
        const messages = [{ role: 'user', content: prompt }];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: config.model || 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system: systemPrompt,
                messages,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Anthropic API error');
        }

        const data = await response.json();
        const content = data.content[0].text;

        if (isVerification) return { success: true, rawResponse: content };

        try {
            // Anthropic often includes chatty prefixes, but with SYSTEM_PROMPT it's better. 
            // We'll perform loose JSON extraction.
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            const parsed = JSON.parse(jsonStr);
            return { success: true, data: parsed, rawResponse: content };
        } catch {
            return { success: false, error: 'Failed to parse JSON response from Claude', rawResponse: content };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Google Gemini Implementation
async function callGemini(config: LLMConfig, prompt: string, isVerification: boolean): Promise<LLMResponse> {
    try {
        const model = config.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

        // Gemini doesn't support 'system' role in the same way for simple REST, 
        // but we can prepend it to the user message or use system_instruction if using the v1beta API correctly.
        // For simplicity in REST:
        // "parts": [{ "text": SYSTEM_PROMPT + "\nUser Input: " + prompt }]

        const fullPrompt = isVerification ? prompt : `${SYSTEM_PROMPT}\n\nUser Message: ${prompt}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    response_mime_type: isVerification ? "text/plain" : "application/json"
                }
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) throw new Error('Empty response from Gemini');

        if (isVerification) return { success: true, rawResponse: content };

        try {
            const parsed = JSON.parse(content);
            return { success: true, data: parsed, rawResponse: content };
        } catch {
            return { success: false, error: 'Failed to parse JSON response from Gemini', rawResponse: content };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
