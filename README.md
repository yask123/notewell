# Notewell

A small API for writing notes and sharing them with people you choose.

```
GET    /documents/:id                  read a document you own or were given
PATCH  /documents/:id                  change its title or body (owner)
POST   /documents/:id/shares           share it with someone (owner)
DELETE /documents/:id/shares/:userId   take that back (owner)
```

TypeScript, Express and Postgres. The rules for who may read or edit a document live in one place,
`src/documents/access-policy.ts`.

```sh
npm install
npm test            # in-memory, no database needed
npm run typecheck
DATABASE_URL=postgres://localhost/notewell npm run dev
```

Reads are cached in Redis when `REDIS_URL` is set, and in memory when it isn't. See [docs/caching.md](docs/caching.md).

## What this repository is for

Notewell is a demonstration codebase for [Tracer](https://yask.dev/tracer), a Mac app that draws a pull request as
one line through the system it changes. The pull requests here are written to be traced. They aren't meant to be
merged, and some contain deliberate flaws: the kind that reads fine in a diff and shows up when you can see where the
request goes.

MIT.
