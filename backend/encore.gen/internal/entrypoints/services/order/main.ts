import { registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";
import { Worker, isMainThread } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

import { create as createImpl0 } from "../../../../../order/create";
import { streamStatus as streamStatusImpl1 } from "../../../../../order/stream_status";
import { track as trackImpl2 } from "../../../../../order/track";
import { webhook as webhookImpl3 } from "../../../../../order/webhook";
import "../../../../../order/orchestration";
import "../../../../../order/orchestration";
import "../../../../../order/stream_status";
import "../../../../../order/stream_status";
import "../../../../../order/stream_status";
import * as order_service from "../../../../../order/encore.service";

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "order",
            name:              "create",
            handler:           createImpl0,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: order_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "order",
            name:              "streamStatus",
            handler:           streamStatusImpl1,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: true,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":true,"tags":[]},
        middlewares: order_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "order",
            name:              "track",
            handler:           trackImpl2,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: order_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "order",
            name:              "webhook",
            handler:           webhookImpl3,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: order_service.default.cfg.middlewares || [],
    },
];

registerHandlers(handlers);

await run(import.meta.url);
