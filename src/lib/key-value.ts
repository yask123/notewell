import { Redis } from "ioredis";

/** The little of Redis the app uses: strings that expire. */
export interface KeyValue {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class RedisKeyValue implements KeyValue {
  private readonly redis: Redis;

  constructor(url: string) {
    this.redis = new Redis(url, { maxRetriesPerRequest: 2, enableOfflineQueue: false });
  }

  get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number) {
    await this.redis.set(key, value, "EX", ttlSeconds);
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}

/** For tests and for running without Redis. Expiry is checked on read. */
export class MemoryKeyValue implements KeyValue {
  private readonly entries = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string) {
    this.entries.delete(key);
  }
}
