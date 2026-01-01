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
export async function list(): Promise<ListMenuResponse> {
    const items = await listAvailableMenuItems();
    return { items };
  }
