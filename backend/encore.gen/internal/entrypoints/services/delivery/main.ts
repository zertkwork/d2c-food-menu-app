import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { listOrders as listOrdersImpl0 } from "../../../../../delivery/list_orders";
import { updateStatus as updateStatusImpl1 } from "../../../../../delivery/update_status";
import * as delivery_service from "../../../../../delivery/encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "delivery",
            name:              "listOrders",
            handler:           listOrdersImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: delivery_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "delivery",
            name:              "updateStatus",
            handler:           updateStatusImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: delivery_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
