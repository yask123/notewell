import type { NextFunction, Request, Response } from "express";
import type pg from "pg";
import { Unauthorized } from "../errors";
import type { User } from "./user";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export interface Sessions {
  userFor(token: string): Promise<User | null>;
}

export class PgSessions implements Sessions {
  constructor(private readonly pool: pg.Pool) {}

  async userFor(token: string): Promise<User | null> {
    const { rows } = await this.pool.query<User>(
      `select u.id, u.email, u.name
         from sessions s join users u on u.id = s.user_id
        where s.token = $1 and s.expires_at > now()`,
      [token],
    );
    return rows[0] ?? null;
  }
}

/** Every route behind this has `req.user`. */
export function requireUser(sessions: Sessions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.get("Authorization")?.replace(/^Bearer /, "");
      const user = token ? await sessions.userFor(token) : null;
      if (!user) throw new Unauthorized();
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
