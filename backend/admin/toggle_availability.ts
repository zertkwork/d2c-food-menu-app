import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface ToggleAvailabilityRequest {
  menuItemId: number;
  available: boolean;
}

export interface ToggleAvailabilityResponse {
  success: boolean;
}

export const toggleAvailability = api(
  { expose: true, method: "POST", path: "/admin/menu/:menuItemId/availability", auth: true },
  async (req: ToggleAvailabilityRequest): Promise<ToggleAvailabilityResponse> => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    await db.exec`
      UPDATE menu_items
      SET available = ${req.available}
      WHERE id = ${req.menuItemId}
    `;

    return { success: true };
  }
);
