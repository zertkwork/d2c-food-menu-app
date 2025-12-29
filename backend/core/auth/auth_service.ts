// Encore-free core service; errors are represented by AuthServiceError
import db from "../../db";

export interface AuthParamsService {
  authorization?: string | undefined;
  session?: string | undefined;
}

export interface AuthDataService {
  userID: string;
  username: string;
  role: "admin" | "kitchen" | "delivery";
}

export class AuthServiceError extends Error {
  constructor(public code: "unauthenticated" | "permission_denied", message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function authService(params: AuthParamsService): Promise<AuthDataService> {
  const token = params.authorization?.replace("Bearer ", "") ?? params.session as any;

  if (!token) {
    throw new AuthServiceError("unauthenticated", "missing authentication token");
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
    throw new AuthServiceError("unauthenticated", "invalid or expired session");
  }

  if (!result.is_active) {
    throw new AuthServiceError("permission_denied", "user account is deactivated");
  }

  if (new Date() > result.expires_at) {
    await db.exec`DELETE FROM sessions WHERE token = ${token}`;
    throw new AuthServiceError("unauthenticated", "session expired");
  }

  return {
    userID: result.user_id.toString(),
    username: result.username,
    role: result.role,
  };
}
