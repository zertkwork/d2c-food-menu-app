import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface UserInfo {
  id: string;
  username: string;
  role: string;
}

export const me = api<void, UserInfo>(
  { method: "GET", path: "/auth/me", expose: true, auth: true },
  async () => {
    const authData = getAuthData()!;
    return {
      id: authData.userID,
      username: authData.username,
      role: authData.role,
    };
  }
);
