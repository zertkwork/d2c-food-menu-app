import { CallOpts } from "encore.dev/api";

type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
type WithCallOpts<T extends (...args: any) => any> = (
  ...args: [...Parameters<T>, opts?: CallOpts]
) => ReturnType<T>;

import { listOrders as listOrders_handler } from "../../../../delivery/list_orders.js";
declare const listOrders: WithCallOpts<typeof listOrders_handler>;
export { listOrders };

import { updateStatus as updateStatus_handler } from "../../../../delivery/update_status.js";
declare const updateStatus: WithCallOpts<typeof updateStatus_handler>;
export { updateStatus };


