import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import crypto from "crypto";

export interface RegisterUserRequest {
  username: string;
  password: string;
  role: "admin" | "kitchen" | "delivery";
}

export interface RegisterUserResponse {
  id: number;
  username: string;
  role: string;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    throw new Error("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain at least one number");
  }
}

function validateUsername(username: string): void {
  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters long");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new Error("Username can only contain letters, numbers, hyphens, and underscores");
  }
}

export const register = api<RegisterUserRequest, RegisterUserResponse>(
  { method: "POST", path: "/auth/register", expose: true, auth: true },
  async (req) => {
    const authData = getAuthData()!;
    
    if (authData.role !== "admin") {
      throw new Error("Only admins can register new users");
    }

    validateUsername(req.username);
    validatePassword(req.password);

    const existingUser = await db.queryRow`
      SELECT id FROM users WHERE username = ${req.username}
    `;

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const passwordHash = await hashPassword(req.password);

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO users (username, password_hash, role)
      VALUES (${req.username}, ${passwordHash}, ${req.role})
      RETURNING id
    `;

    return {
      id: result!.id,
      username: req.username,
      role: req.role,
    };
  }
);
