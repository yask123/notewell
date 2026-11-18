function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: () => required("DATABASE_URL"),
  /** Unset in development: documents are cached in memory instead. */
  redisUrl: process.env.REDIS_URL,
  /** How long a document may be served from the cache after it was last loaded. */
  documentCacheTtlSeconds: Number(process.env.DOCUMENT_CACHE_TTL_SECONDS ?? 300),
};
