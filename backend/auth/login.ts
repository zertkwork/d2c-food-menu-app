import { api, Cookie, Header } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { loginService } from "../core/auth/login_service";

export interface LoginRequest {
  username: string;
  password: string;
  xForwardedFor?: Header<"X-Forwarded-For">;
  xRealIp?: Header<"X-Real-IP">;
  userAgent?: Header<"User-Agent">;
}

export interface LoginResponse {
  session: Cookie<"session">;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

const jwtSecret = secret("JWTSecret");

export const login = api<LoginRequest, LoginResponse>(
  { method: "POST", path: "/auth/login", expose: true },
  async (req: LoginRequest) => {
    const result = await loginService({
      username: req.username,
      password: req.password,
      xForwardedFor: req.xForwardedFor as any,
      xRealIp: req.xRealIp as any,
      userAgent: req.userAgent as any,
      jwtSecret: jwtSecret(),
    });
    return result;
  }
);
