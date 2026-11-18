import type { KeyValue } from "../lib/key-value";
import type { Document } from "./document";

/**
 * Documents by id, kept in Redis for a few minutes.
 *
 * One entry per document, whoever asked for it: a note shared with forty people is
 * stored once, not forty times, and one `drop` clears it for all of them.
 */
export class DocumentCache {
  constructor(
    private readonly store: KeyValue,
    private readonly ttlSeconds: number,
  ) {}

  private key(id: string) {
    return `document:${id}`;
  }

  async get(id: string): Promise<Document | null> {
    const raw = await this.store.get(this.key(id));
    return raw ? (JSON.parse(raw) as Document) : null;
  }

  async put(doc: Document): Promise<void> {
    await this.store.set(this.key(doc.id), JSON.stringify(doc), this.ttlSeconds);
  }

  async drop(id: string): Promise<void> {
    await this.store.del(this.key(id));
  }
}
