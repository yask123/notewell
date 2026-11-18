import request from "supertest";
import { createApp } from "../src/app";
import type { Sessions } from "../src/auth/session";
import type { User } from "../src/auth/user";
import { buildContainer } from "../src/container";
import type { Document } from "../src/documents/document";
import type { DocumentRepository } from "../src/documents/document.repository";

export class MemoryDocuments implements DocumentRepository {
  private readonly rows = new Map<string, Document>();
  /** How many times a document was looked up, for tests that care. */
  lookups = 0;

  async findById(id: string) {
    this.lookups += 1;
    const doc = this.rows.get(id);
    return doc ? structuredClone(doc) : null;
  }

  async save(doc: Document) {
    const saved = { ...doc, updatedAt: new Date().toISOString() };
    this.rows.set(doc.id, saved);
    return structuredClone(saved);
  }
}

export class MemorySessions implements Sessions {
  private readonly byToken = new Map<string, User>();

  add(user: User): string {
    const token = `token-${user.id}`;
    this.byToken.set(token, user);
    return token;
  }

  async userFor(token: string) {
    return this.byToken.get(token) ?? null;
  }
}

const person = (id: string): User => ({ id, email: `${id}@example.com`, name: id });

/** An app with three people in it: Ada owns a document, Ben has been given it, Eve hasn't. */
export async function world() {
  const documents = new MemoryDocuments();
  const sessions = new MemorySessions();
  const [ada, ben, eve] = ["ada", "ben", "eve"].map(person);
  const tokens = { ada: sessions.add(ada), ben: sessions.add(ben), eve: sessions.add(eve) };

  await documents.save({
    id: "doc-1",
    ownerId: ada.id,
    title: "Q3 board notes",
    body: "Runway is 14 months. Do not circulate.",
    sharedWith: [ben.id],
    updatedAt: "",
  });

  const app = createApp(buildContainer({ documents, sessions }));
  const as = (who: keyof typeof tokens) => ({
    get: (path: string) => request(app).get(path).set("Authorization", `Bearer ${tokens[who]}`),
    patch: (path: string, body: object) => request(app).patch(path).set("Authorization", `Bearer ${tokens[who]}`).send(body),
    post: (path: string, body: object) => request(app).post(path).set("Authorization", `Bearer ${tokens[who]}`).send(body),
    delete: (path: string) => request(app).delete(path).set("Authorization", `Bearer ${tokens[who]}`),
  });

  return { app, as, documents };
}
