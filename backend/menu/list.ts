import { api } from "encore.dev/api";
import db from "../db";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

interface ListMenuResponse {
  items: MenuItem[];
}

// Lists all available menu items.
export const list = api<void, ListMenuResponse>(
  { expose: true, method: "GET", path: "/menu" },
  async () => {
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
      WHERE available = true
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
