import { CallOpts } from "encore.dev/api";

type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
type WithCallOpts<T extends (...args: any) => any> = (
  ...args: [...Parameters<T>, opts?: CallOpts]
) => ReturnType<T>;

import { getAnalytics as getAnalytics_handler } from "../../../../admin/get_analytics.js";
declare const getAnalytics: WithCallOpts<typeof getAnalytics_handler>;
export { getAnalytics };

import { listAllMenu as listAllMenu_handler } from "../../../../admin/list_all_menu.js";
declare const listAllMenu: WithCallOpts<typeof listAllMenu_handler>;
export { listAllMenu };

import { listOrders as listOrders_handler } from "../../../../admin/list_orders.js";
declare const listOrders: WithCallOpts<typeof listOrders_handler>;
export { listOrders };

import { toggleAvailability as toggleAvailability_handler } from "../../../../admin/toggle_availability.js";
declare const toggleAvailability: WithCallOpts<typeof toggleAvailability_handler>;
export { toggleAvailability };

import { updateOrderStatus as updateOrderStatus_handler } from "../../../../admin/update_order_status.js";
declare const updateOrderStatus: WithCallOpts<typeof updateOrderStatus_handler>;
export { updateOrderStatus };


