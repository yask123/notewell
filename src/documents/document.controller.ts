import type { Request, Response } from "express";
import { present } from "./document";
import type { DocumentReader } from "./document-reader";
import type { DocumentService } from "./document.service";

export class DocumentController {
  constructor(
    private readonly documents: DocumentService,
    private readonly reader: DocumentReader,
  ) {}

  show = async (req: Request, res: Response) => {
    const doc = await this.reader.read(req.user, req.params.id);
    res.json(present(doc));
  };

  update = async (req: Request, res: Response) => {
    const { title, body } = req.body ?? {};
    const doc = await this.documents.update(req.user, req.params.id, { title, body });
    res.json(present(doc));
  };

  share = async (req: Request, res: Response) => {
    const doc = await this.documents.share(req.user, req.params.id, String(req.body?.userId));
    res.status(201).json(present(doc));
  };

  unshare = async (req: Request, res: Response) => {
    const doc = await this.documents.unshare(req.user, req.params.id, req.params.userId);
    res.json(present(doc));
  };
}
