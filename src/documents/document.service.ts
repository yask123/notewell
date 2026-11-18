import type { User } from "../auth/user";
import { NotFound } from "../errors";
import type { AccessPolicy } from "./access-policy";
import type { Document } from "./document";
import type { DocumentRepository } from "./document.repository";

export interface DocumentChanges {
  title?: string;
  body?: string;
}

export class DocumentService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly policy: AccessPolicy,
  ) {}

  async get(user: User, id: string): Promise<Document> {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFound("document");
    this.policy.assertCanRead(user, doc);
    return doc;
  }

  async update(user: User, id: string, changes: DocumentChanges): Promise<Document> {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFound("document");
    this.policy.assertCanEdit(user, doc);
    return this.repo.save({ ...doc, ...changes });
  }

  async share(user: User, id: string, withUserId: string): Promise<Document> {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFound("document");
    this.policy.assertCanEdit(user, doc);
    if (doc.sharedWith.includes(withUserId)) return doc;
    return this.repo.save({ ...doc, sharedWith: [...doc.sharedWith, withUserId] });
  }

  async unshare(user: User, id: string, withUserId: string): Promise<Document> {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFound("document");
    this.policy.assertCanEdit(user, doc);
    return this.repo.save({ ...doc, sharedWith: doc.sharedWith.filter((u) => u !== withUserId) });
  }
}
