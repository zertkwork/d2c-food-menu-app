import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as admin_service from "../../../../admin/encore.service";

export async function getAnalytics(params, opts) {
    const handler = (await import("../../../../admin/get_analytics")).getAnalytics;
    registerTestHandler({
        apiRoute: { service: "admin", name: "getAnalytics", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "getAnalytics", params, opts);
}

export async function listAllMenu(params, opts) {
    const handler = (await import("../../../../admin/list_all_menu")).listAllMenu;
    registerTestHandler({
        apiRoute: { service: "admin", name: "listAllMenu", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "listAllMenu", params, opts);
}

export async function listOrders(params, opts) {
    const handler = (await import("../../../../admin/list_orders")).listOrders;
    registerTestHandler({
        apiRoute: { service: "admin", name: "listOrders", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "listOrders", params, opts);
}

export async function toggleAvailability(params, opts) {
    const handler = (await import("../../../../admin/toggle_availability")).toggleAvailability;
    registerTestHandler({
        apiRoute: { service: "admin", name: "toggleAvailability", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "toggleAvailability", params, opts);
}

export async function updateOrderStatus(params, opts) {
    const handler = (await import("../../../../admin/update_order_status")).updateOrderStatus;
    registerTestHandler({
        apiRoute: { service: "admin", name: "updateOrderStatus", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: admin_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("admin", "updateOrderStatus", params, opts);
}

