import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as order_service from "../../../../order/encore.service";

export async function create(params, opts) {
    const handler = (await import("../../../../order/create")).create;
    registerTestHandler({
        apiRoute: { service: "order", name: "create", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: order_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("order", "create", params, opts);
}

export async function streamStatus(params, opts) {
    const handler = (await import("../../../../order/stream_status")).streamStatus;
    registerTestHandler({
        apiRoute: { service: "order", name: "streamStatus", raw: false, handler, streamingRequest: false, streamingResponse: true },
        middlewares: order_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":true,"tags":[]},
    });

    return streamOut("order", "streamStatus", params, opts);
}

export async function track(params, opts) {
    const handler = (await import("../../../../order/track")).track;
    registerTestHandler({
        apiRoute: { service: "order", name: "track", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: order_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("order", "track", params, opts);
}

export async function webhook(params, opts) {
    const handler = (await import("../../../../order/webhook")).webhook;
    registerTestHandler({
        apiRoute: { service: "order", name: "webhook", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: order_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("order", "webhook", params, opts);
}

