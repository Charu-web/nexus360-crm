import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './provider.interface';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.defaultModel = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  public getProviderName(): string {
    return 'OpenAI-Compatible Provider';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('placeholder'));
  }

  public async chatCompletion(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured. Falling back to deterministic engine.');
    }

    const model = options.model || this.defaultModel;
    const body: Record<string, any> = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024
    };

    if (options.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      provider: 'openai',
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  }

  public async generateStructuredResponse<T = any>(prompt: string, systemPrompt?: string): Promise<T> {
    const messages: LLMMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await this.chatCompletion(messages, { responseFormat: 'json', temperature: 0.2 });
    try {
      return JSON.parse(res.content);
    } catch (e: any) {
      throw new Error(`Failed to parse structured response from LLM: ${e.message}`);
    }
  }
}
