import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

export class Unauthorized extends HttpError {
  constructor() {
    super(401, "unauthorized");
  }
}

export class Forbidden extends HttpError {
  constructor() {
    super(403, "forbidden");
  }
}

export class NotFound extends HttpError {
  constructor(what: string) {
    super(404, `${what}_not_found`);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal" });
}
