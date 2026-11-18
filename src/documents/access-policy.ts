import type { User } from "../auth/user";
import { Forbidden, NotFound } from "../errors";
import type { Document } from "./document";

/** Who may do what to a document. The only place these rules live. */
export class AccessPolicy {
  canRead(user: User, doc: Document): boolean {
    return doc.ownerId === user.id || doc.sharedWith.includes(user.id);
  }

  canEdit(user: User, doc: Document): boolean {
    return doc.ownerId === user.id;
  }

  /** A document you can't read looks like one that doesn't exist. */
  assertCanRead(user: User, doc: Document): void {
    if (!this.canRead(user, doc)) throw new NotFound("document");
  }

  assertCanEdit(user: User, doc: Document): void {
    this.assertCanRead(user, doc);
    if (!this.canEdit(user, doc)) throw new Forbidden();
  }
}
