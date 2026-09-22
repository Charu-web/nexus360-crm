import { config } from '../config';

class RedisFallback {
  status: string = 'ready';
  private store = new Map<string, string>();

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, _mode?: string, _duration?: number) {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string) {
    this.store.delete(key);
    return 1;
  }

  on(_event: string, _cb: any) {}
}

let redisInstance: any;

try {
  const Redis = require('ioredis');
  redisInstance = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
} catch (e) {
  redisInstance = new RedisFallback();
}

export const redis = redisInstance;
