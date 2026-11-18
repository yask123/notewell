import { createApp } from "./app";
import { PgSessions } from "./auth/session";
import { config } from "./config";
import { buildContainer } from "./container";
import { createPool } from "./db/pool";
import { PgDocumentRepository } from "./documents/document.repository";

const pool = createPool();

const app = createApp(
  buildContainer({
    documents: new PgDocumentRepository(pool),
    sessions: new PgSessions(pool),
  }),
);

app.listen(config.port, () => {
  console.log(`notewell listening on :${config.port}`);
});
