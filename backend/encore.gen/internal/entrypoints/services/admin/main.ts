import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { getAnalytics as getAnalyticsImpl0 } from "../../../../../admin/get_analytics";
import { listAllMenu as listAllMenuImpl1 } from "../../../../../admin/list_all_menu";
import { listOrders as listOrdersImpl2 } from "../../../../../admin/list_orders";
import { toggleAvailability as toggleAvailabilityImpl3 } from "../../../../../admin/toggle_availability";
import { updateOrderStatus as updateOrderStatusImpl4 } from "../../../../../admin/update_order_status";
import * as admin_service from "../../../../../admin/encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "admin",
            name:              "getAnalytics",
            handler:           getAnalyticsImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "admin",
            name:              "listAllMenu",
            handler:           listAllMenuImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "admin",
            name:              "listOrders",
            handler:           listOrdersImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "admin",
            name:              "toggleAvailability",
            handler:           toggleAvailabilityImpl3,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "admin",
            name:              "updateOrderStatus",
            handler:           updateOrderStatusImpl4,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
