import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { listOrders as listOrdersImpl0 } from "../../../../../kitchen/list_orders";
import { streamOrders as streamOrdersImpl1 } from "../../../../../kitchen/stream_orders";
import { updateStatus as updateStatusImpl2 } from "../../../../../kitchen/update_status";
import "../../../../../kitchen/stream_orders";
import "../../../../../kitchen/stream_orders";
import * as kitchen_service from "../../../../../kitchen/encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "kitchen",
            name:              "listOrders",
            handler:           listOrdersImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: kitchen_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "kitchen",
            name:              "streamOrders",
            handler:           streamOrdersImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: true,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":true,"tags":[]},
        middlewares: kitchen_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "kitchen",
            name:              "updateStatus",
            handler:           updateStatusImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: kitchen_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
