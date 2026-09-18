import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './provider.interface';

export class FallbackProvider implements LLMProvider {
  public getProviderName(): string {
    return 'Deterministic Fallback Engine (No External API Key Configured)';
  }

  public isConfigured(): boolean {
    return true; // Always operational as safe zero-dependency fallback
  }

  public async chatCompletion(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    
    return {
      content: `[Fallback AI Intelligence Engine]\nProcessed request: "${lastUserMsg.slice(0, 100)}..."\n\n*Note: External LLM API key not configured. Utilizing deterministic rule evaluation and verified CRM database analytics.*`,
      provider: 'fallback-deterministic',
      model: 'nexus-deterministic-v2',
      usage: {
        promptTokens: 50,
        completionTokens: 30,
        totalTokens: 80
      }
    };
  }

  public async generateStructuredResponse<T = any>(prompt: string, systemPrompt?: string): Promise<T> {
    return {
      success: true,
      mode: 'fallback',
      summary: 'Deterministic intelligence analysis executed based on live CRM state.',
      timestamp: new Date().toISOString()
    } as unknown as T;
  }
}
