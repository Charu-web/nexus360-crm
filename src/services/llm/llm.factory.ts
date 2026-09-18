import { LLMProvider } from './provider.interface';
import { OpenAIProvider } from './openai.provider';
import { FallbackProvider } from './fallback.provider';

export class LLMFactory {
  private static cachedProvider: LLMProvider | null = null;

  public static getProvider(): LLMProvider {
    if (this.cachedProvider) {
      return this.cachedProvider;
    }

    const openAI = new OpenAIProvider();
    if (openAI.isConfigured()) {
      this.cachedProvider = openAI;
      return this.cachedProvider;
    }

    this.cachedProvider = new FallbackProvider();
    return this.cachedProvider;
  }

  public static getProviderStatus(): {
    providerName: string;
    isExternalConfigured: boolean;
    activeModel: string;
  } {
    const provider = this.getProvider();
    const isExternal = provider instanceof OpenAIProvider && provider.isConfigured();
    return {
      providerName: provider.getProviderName(),
      isExternalConfigured: isExternal,
      activeModel: isExternal ? (process.env.AI_MODEL || 'gpt-4o-mini') : 'nexus-deterministic-v2'
    };
  }

  public static resetProvider(): void {
    this.cachedProvider = null;
  }
}
