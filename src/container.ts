import type { Sessions } from "./auth/session";
import { AccessPolicy } from "./documents/access-policy";
import { DocumentController } from "./documents/document.controller";
import type { DocumentRepository } from "./documents/document.repository";
import { DocumentService } from "./documents/document.service";

/** What the app needs from the outside world. Tests pass in-memory ones. */
export interface Dependencies {
  documents: DocumentRepository;
  sessions: Sessions;
}

export function buildContainer(deps: Dependencies) {
  const policy = new AccessPolicy();
  const documentService = new DocumentService(deps.documents, policy);

  return {
    sessions: deps.sessions,
    documentController: new DocumentController(documentService),
  };
}

export type Container = ReturnType<typeof buildContainer>;
