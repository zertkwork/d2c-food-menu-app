// Encore runtime removed
import type { Header, Cookie } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface LogoutRequest {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export async function logout(req: LogoutRequest): Promise<{ success: boolean }> {
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

