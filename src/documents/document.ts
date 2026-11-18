export interface Document {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  /** Ids of the people the owner has shared this with. */
  sharedWith: string[];
  updatedAt: string;
}

/** A document as the API returns it. */
export function present(doc: Document) {
  return {
    id: doc.id,
    title: doc.title,
    body: doc.body,
    owner: doc.ownerId,
    shared: doc.sharedWith.length > 0,
    updatedAt: doc.updatedAt,
  };
}
