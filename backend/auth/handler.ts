import { Header, Cookie, Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { authService, AuthServiceError } from "../core/auth/auth_service";

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
    try {
      const result = await authService({
        authorization: params.authorization as any,
        session: params.session as any,
      });
      return result;
    } catch (err) {
      if (err instanceof AuthServiceError) {
        if (err.code === "unauthenticated") {
          throw APIError.unauthenticated(err.message);
        }
        if (err.code === "permission_denied") {
          throw APIError.permissionDenied(err.message);
        }
      }
      throw err;
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
