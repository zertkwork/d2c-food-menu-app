// Encore runtime removed
import { getAuthData } from "~encore/auth";

export interface UserInfo {
  id: string;
  username: string;
  role: string;
}

export async function me(): Promise<UserInfo> {
    const authData = getAuthData()!;
    return {
      id: authData.userID,
      username: authData.username,
      role: authData.role,
    };
  }

