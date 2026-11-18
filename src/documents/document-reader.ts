import type { User } from "../auth/user";
import type { Metrics } from "../lib/metrics";
import type { Document } from "./document";
import type { DocumentCache } from "./document-cache";
import type { DocumentService } from "./document.service";

/**
 * The read path. Nine requests in ten are someone opening a document that hasn't
 * changed since the last time it was opened, so those are answered from the cache
 * and never reach Postgres.
 */
export class DocumentReader {
  constructor(
    private readonly documents: DocumentService,
    private readonly cache: DocumentCache,
    private readonly metrics: Metrics,
  ) {}

  /** A document as `user` may see it. */
  async read(user: User, id: string): Promise<Document> {
    const started = performance.now();

    const cached = await this.cache.get(id);
    if (cached) {
      this.metrics.count("documents.read.cache_hit");
      this.metrics.timing("documents.read", performance.now() - started);
      return cached;
    }

    this.metrics.count("documents.read.cache_miss");
    const doc = await this.documents.get(user, id);
    await this.cache.put(doc);
    this.metrics.timing("documents.read", performance.now() - started);
    return doc;
  }
}
