import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as kitchen_service from "../../../../kitchen/encore.service";

export async function listOrders(params, opts) {
    const handler = (await import("../../../../kitchen/list_orders")).listOrders;
    registerTestHandler({
        apiRoute: { service: "kitchen", name: "listOrders", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: kitchen_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("kitchen", "listOrders", params, opts);
}

export async function streamOrders(params, opts) {
    const handler = (await import("../../../../kitchen/stream_orders")).streamOrders;
    registerTestHandler({
        apiRoute: { service: "kitchen", name: "streamOrders", raw: false, handler, streamingRequest: false, streamingResponse: true },
        middlewares: kitchen_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":true,"tags":[]},
    });

    return streamOut("kitchen", "streamOrders", params, opts);
}

export async function updateStatus(params, opts) {
    const handler = (await import("../../../../kitchen/update_status")).updateStatus;
    registerTestHandler({
        apiRoute: { service: "kitchen", name: "updateStatus", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: kitchen_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("kitchen", "updateStatus", params, opts);
}

