import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as delivery_service from "../../../../delivery/encore.service";

export async function listOrders(params, opts) {
    const handler = (await import("../../../../delivery/list_orders")).listOrders;
    registerTestHandler({
        apiRoute: { service: "delivery", name: "listOrders", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: delivery_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("delivery", "listOrders", params, opts);
}

export async function updateStatus(params, opts) {
    const handler = (await import("../../../../delivery/update_status")).updateStatus;
    registerTestHandler({
        apiRoute: { service: "delivery", name: "updateStatus", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: delivery_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("delivery", "updateStatus", params, opts);
}

