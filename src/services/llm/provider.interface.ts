export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  responseFormat?: 'text' | 'json';
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  getProviderName(): string;
  isConfigured(): boolean;
  chatCompletion(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  generateStructuredResponse<T = any>(prompt: string, systemPrompt?: string): Promise<T>;
}
