import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import db from "../db";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  username: string;
  role: "admin" | "kitchen" | "delivery";
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "") ?? params.session;
    
    if (!token) {
      throw APIError.unauthenticated("missing authentication token");
    }

    const result = await db.queryRow<{
      user_id: number;
      username: string;
      role: "admin" | "kitchen" | "delivery";
      expires_at: Date;
      is_active: boolean;
    }>`
      SELECT 
        s.user_id,
        u.username,
        u.role,
        s.expires_at,
        u.is_active
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${token}
    `;

    if (!result) {
      throw APIError.unauthenticated("invalid or expired session");
    }

    if (!result.is_active) {
      throw APIError.permissionDenied("user account is deactivated");
    }

    if (new Date() > result.expires_at) {
      await db.exec`DELETE FROM sessions WHERE token = ${token}`;
      throw APIError.unauthenticated("session expired");
    }

    return {
      userID: result.user_id.toString(),
      username: result.username,
      role: result.role,
    };
  }
);

export const gw = new Gateway({ authHandler: auth });
