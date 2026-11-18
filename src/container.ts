import type { Sessions } from "./auth/session";
import { config } from "./config";
import { AccessPolicy } from "./documents/access-policy";
import { DocumentCache } from "./documents/document-cache";
import { DocumentController } from "./documents/document.controller";
import { DocumentReader } from "./documents/document-reader";
import type { DocumentRepository } from "./documents/document.repository";
import { DocumentService } from "./documents/document.service";
import type { KeyValue } from "./lib/key-value";
import { type Metrics, NoMetrics } from "./lib/metrics";

/** What the app needs from the outside world. Tests pass in-memory ones. */
export interface Dependencies {
  documents: DocumentRepository;
  sessions: Sessions;
  keyValue: KeyValue;
  metrics?: Metrics;
}

export function buildContainer(deps: Dependencies) {
  const metrics = deps.metrics ?? new NoMetrics();
  const policy = new AccessPolicy(metrics);
  const documentCache = new DocumentCache(deps.keyValue, config.documentCacheTtlSeconds);
  const documentService = new DocumentService(deps.documents, policy, documentCache);
  const documentReader = new DocumentReader(documentService, documentCache, metrics);

  return {
    sessions: deps.sessions,
    documentController: new DocumentController(documentService, documentReader),
  };
}

export type Container = ReturnType<typeof buildContainer>;
