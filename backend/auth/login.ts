import { api, Cookie, Header } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";
import crypto from "crypto";

const jwtSecret = secret("JWTSecret");

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

async function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(":");
  const computedHash = await hashPassword(password, salt);
  return computedHash === storedHash;
}

async function checkRateLimit(username: string, ipAddress: string): Promise<void> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const { count: usernameAttempts } = await db.queryRow<{ count: number }>`
    SELECT COUNT(*) as count
    FROM login_attempts
    WHERE username = ${username}
      AND attempted_at > ${fiveMinutesAgo}
      AND success = FALSE
  ` || { count: 0 };

  if (usernameAttempts >= 5) {
    throw new Error("Too many failed login attempts. Please try again later.");
  }

  const { count: ipAttempts } = await db.queryRow<{ count: number }>`
    SELECT COUNT(*) as count
    FROM login_attempts
    WHERE ip_address = ${ipAddress}
      AND attempted_at > ${fiveMinutesAgo}
      AND success = FALSE
  ` || { count: 0 };

  if (ipAttempts >= 10) {
    throw new Error("Too many failed login attempts from this IP. Please try again later.");
  }
}

async function logLoginAttempt(username: string, ipAddress: string, success: boolean): Promise<void> {
  await db.exec`
    INSERT INTO login_attempts (username, ip_address, success)
    VALUES (${username}, ${ipAddress}, ${success})
  `;
}

export const login = api<LoginRequest, LoginResponse>(
  { method: "POST", path: "/auth/login", expose: true },
  async (req: LoginRequest) => {
    const ipAddress = req.xForwardedFor || req.xRealIp || "unknown";
    
    try {
      await checkRateLimit(req.username, ipAddress);
    } catch (err) {
      await logLoginAttempt(req.username, ipAddress, false);
      throw new Error((err as Error).message);
    }

    const user = await db.queryRow<{
      id: number;
      username: string;
      password_hash: string;
      role: string;
      is_active: boolean;
    }>`
      SELECT id, username, password_hash, role, is_active
      FROM users
      WHERE username = ${req.username}
    `;

    if (!user) {
      await logLoginAttempt(req.username, ipAddress, false);
      throw new Error("Invalid username or password");
    }

    if (!user.is_active) {
      await logLoginAttempt(req.username, ipAddress, false);
      throw new Error("Account is deactivated");
    }

    const isValid = await verifyPassword(req.password, user.password_hash);
    
    if (!isValid) {
      await logLoginAttempt(req.username, ipAddress, false);
      throw new Error("Invalid username or password");
    }

    await logLoginAttempt(req.username, ipAddress, true);

    const token = crypto.randomBytes(32).toString("hex") + "." + jwtSecret();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.exec`
      INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt}, ${ipAddress}, ${req.userAgent || ""})
    `;

    await db.exec`
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    return {
      session: {
        value: tokenHash,
        expires: expiresAt,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
);
