import { createApp } from "./app";
import { PgSessions } from "./auth/session";
import { config } from "./config";
import { buildContainer } from "./container";
import { createPool } from "./db/pool";
import { PgDocumentRepository } from "./documents/document.repository";
import { MemoryKeyValue, RedisKeyValue } from "./lib/key-value";
import { ConsoleMetrics } from "./lib/metrics";

const pool = createPool();

const app = createApp(
  buildContainer({
    documents: new PgDocumentRepository(pool),
    sessions: new PgSessions(pool),
    keyValue: config.redisUrl ? new RedisKeyValue(config.redisUrl) : new MemoryKeyValue(),
    metrics: new ConsoleMetrics(),
  }),
);

app.listen(config.port, () => {
  console.log(`notewell listening on :${config.port}`);
});
