import { api, Header, Cookie } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface LogoutRequest {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export const logout = api<LogoutRequest, { success: boolean }>(
  { method: "POST", path: "/auth/logout", expose: true, auth: true },
  async (req: LogoutRequest) => {
    const authData = getAuthData()!;
    const token = req.authorization?.replace("Bearer ", "") ?? req.session;
    
    if (token) {
      await db.exec`
        DELETE FROM sessions
        WHERE token = ${token}
      `;
    }

    return { success: true };
  }
);
