import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";
import crypto from "crypto";

const setupSecret = secret("InitialSetupSecret");

export interface SetupRequest {
  setupSecret: string;
  username: string;
  password: string;
}

export interface SetupResponse {
  success: boolean;
  message: string;
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

export const setup = api<SetupRequest, SetupResponse>(
  { method: "POST", path: "/auth/setup", expose: true },
  async (req) => {
    if (req.setupSecret !== setupSecret()) {
      throw new Error("Invalid setup secret");
    }

    const existingUsers = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM users
    `;

    if (existingUsers && existingUsers.count > 0) {
      throw new Error("Setup already completed. Users already exist in the system.");
    }

    if (req.username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    if (req.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const passwordHash = await hashPassword(req.password);

    await db.exec`
      INSERT INTO users (username, password_hash, role)
      VALUES (${req.username}, ${passwordHash}, 'admin')
    `;

    return {
      success: true,
      message: "Initial admin user created successfully",
    };
  }
);
