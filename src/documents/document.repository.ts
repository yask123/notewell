import type pg from "pg";
import type { Document } from "./document";

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>;
  save(doc: Document): Promise<Document>;
}

interface Row {
  id: string;
  owner_id: string;
  title: string;
  body: string;
  shared_with: string[];
  updated_at: Date;
}

const fromRow = (r: Row): Document => ({
  id: r.id,
  ownerId: r.owner_id,
  title: r.title,
  body: r.body,
  sharedWith: r.shared_with,
  updatedAt: r.updated_at.toISOString(),
});

export class PgDocumentRepository implements DocumentRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Document | null> {
    const { rows } = await this.pool.query<Row>("select * from documents where id = $1", [id]);
    return rows[0] ? fromRow(rows[0]) : null;
  }

  async save(doc: Document): Promise<Document> {
    const { rows } = await this.pool.query<Row>(
      `insert into documents (id, owner_id, title, body, shared_with, updated_at)
       values ($1, $2, $3, $4, $5, now())
       on conflict (id) do update
         set title = excluded.title, body = excluded.body, shared_with = excluded.shared_with, updated_at = now()
       returning *`,
      [doc.id, doc.ownerId, doc.title, doc.body, doc.sharedWith],
    );
    return fromRow(rows[0]);
  }
}
