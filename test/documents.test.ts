import request from "supertest";
import { describe, expect, it } from "vitest";
import { world } from "./helpers";

describe("reading a document", () => {
  it("lets the owner read it", async () => {
    const { as } = await world();
    const res = await as("ada").get("/documents/doc-1");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Q3 board notes");
  });

  it("lets someone it was shared with read it", async () => {
    const { as } = await world();
    const res = await as("ben").get("/documents/doc-1");
    expect(res.status).toBe(200);
  });

  it("hides it from everyone else", async () => {
    const { as } = await world();
    const res = await as("eve").get("/documents/doc-1");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "document_not_found" });
  });

  it("needs a session", async () => {
    const { app } = await world();
    const res = await request(app).get("/documents/doc-1");
    expect(res.status).toBe(401);
  });
});

describe("changing a document", () => {
  it("lets the owner edit it", async () => {
    const { as } = await world();
    const res = await as("ada").patch("/documents/doc-1", { title: "Q3 board notes (final)" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Q3 board notes (final)");
  });

  it("doesn't let a reader edit it", async () => {
    const { as } = await world();
    const res = await as("ben").patch("/documents/doc-1", { title: "mine now" });
    expect(res.status).toBe(403);
  });

  it("stops being readable once it's unshared", async () => {
    const { as } = await world();
    await as("ada").delete("/documents/doc-1/shares/ben");
    const res = await as("ben").get("/documents/doc-1");
    expect(res.status).toBe(404);
  });
});
