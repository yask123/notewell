import { describe, expect, it } from "vitest";
import { world } from "./helpers";

describe("reading a document through the cache", () => {
  it("loads it from the database the first time", async () => {
    const { as, documents } = await world();
    documents.lookups = 0;

    const res = await as("ada").get("/documents/doc-1");

    expect(res.status).toBe(200);
    expect(documents.lookups).toBe(1);
  });

  it("answers the second read without touching the database", async () => {
    const { as, documents } = await world();
    await as("ada").get("/documents/doc-1");
    documents.lookups = 0;

    const res = await as("ada").get("/documents/doc-1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Q3 board notes");
    expect(documents.lookups).toBe(0);
  });

  it("serves everyone the document is shared with from the same entry", async () => {
    const { as, documents } = await world();
    await as("ada").get("/documents/doc-1");
    documents.lookups = 0;

    const res = await as("ben").get("/documents/doc-1");

    expect(res.status).toBe(200);
    expect(documents.lookups).toBe(0);
  });

  it("shows an edit on the very next read", async () => {
    const { as } = await world();
    await as("ada").get("/documents/doc-1");

    await as("ada").patch("/documents/doc-1", { title: "Q3 board notes (final)" });
    const res = await as("ada").get("/documents/doc-1");

    expect(res.body.title).toBe("Q3 board notes (final)");
  });

  it("still returns 404 for a document that doesn't exist", async () => {
    const { as } = await world();
    const res = await as("ada").get("/documents/nope");
    expect(res.status).toBe(404);
  });
});
