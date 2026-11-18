# Caching document reads

`GET /documents/:id` is 91% of traffic, and most of it is the same few documents being reopened. Each read used to
cost a Postgres round trip (p95 180 ms at peak, when the pool is busy with writes).

Reads now go through `DocumentReader`:

1. Look the document up in Redis by its id.
2. On a hit, return it.
3. On a miss, load it through `DocumentService.get`, store it for `DOCUMENT_CACHE_TTL_SECONDS` (300), return it.

`DocumentService.update` drops the entry, so an edit shows on the next read.

## Why one entry per document

The key is `document:<id>`, not `document:<id>:<user>`. A note shared with a team would otherwise be stored once per
reader, and an edit would have to find and drop every copy. One entry is smaller and can't go stale for some readers
and not others.

## Running without Redis

Leave `REDIS_URL` unset and the cache lives in the process. Fine for development; in production every instance would
have its own copy, so set it.
