import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

interface ListAllMenuResponse {
  items: MenuItem[];
}

export const listAllMenu = api<void, ListAllMenuResponse>(
  { expose: true, method: "GET", path: "/admin/menu", auth: true },
  async () => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    const rows = await db.queryAll<{
      id: number;
      name: string;
      description: string;
      price: number;
      image_url: string;
      available: boolean;
    }>`
      SELECT id, name, description, price, image_url, available
      FROM menu_items
      ORDER BY id ASC
    `;

    const items = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      available: row.available,
    }));

    return { items };
  }
);
