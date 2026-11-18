import express, { type NextFunction, type Request, type Response } from "express";
import { requireUser } from "./auth/session";
import type { Container } from "./container";
import { errorHandler } from "./errors";

type Handler = (req: Request, res: Response) => Promise<void>;

/** Express 4 doesn't catch a rejected handler by itself. */
const run = (handler: Handler) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res).catch(next);
};

export function createApp(container: Container) {
  const app = express();
  app.use(express.json());

  const documents = container.documentController;
  const api = express.Router();
  api.use(requireUser(container.sessions));
  api.get("/documents/:id", run(documents.show));
  api.patch("/documents/:id", run(documents.update));
  api.post("/documents/:id/shares", run(documents.share));
  api.delete("/documents/:id/shares/:userId", run(documents.unshare));

  app.use(api);
  app.use(errorHandler);
  return app;
}
