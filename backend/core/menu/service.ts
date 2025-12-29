import db from "../../db";

interface MenuRow {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
}

export async function listAvailableMenuItems() {
  const rows = await db.queryAll<MenuRow>`
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

  return items;
}
