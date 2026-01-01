// Encore runtime removed
import type { Cookie, Header } from "encore.dev/api";
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

// Secrets via env only; Encore config removed

export async function login(req: LoginRequest): Promise<LoginResponse> {
    const result = await loginService({
      username: req.username,
      password: req.password,
      xForwardedFor: req.xForwardedFor as any,
      xRealIp: req.xRealIp as any,
      userAgent: req.userAgent as any,
      jwtSecret: (() => { const v = process.env.JWT_SECRET; if (!v) throw new Error("Missing JWT_SECRET"); return v; })(),
    });
    return result;
  }

