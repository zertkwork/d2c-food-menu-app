import { api } from "encore.dev/api";
import { listAvailableMenuItems } from "../core/menu/service";

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
    const items = await listAvailableMenuItems();
    return { items };
  }
);
