import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";

const TEST_ENDPOINTS = typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test"
    ? await import("./endpoints_testing.js")
    : null;

export async function getAnalytics(opts) {
    const params = undefined;
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.getAnalytics(params, opts);
    }

    return apiCall("admin", "getAnalytics", params, opts);
}
export async function listAllMenu(opts) {
    const params = undefined;
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.listAllMenu(params, opts);
    }

    return apiCall("admin", "listAllMenu", params, opts);
}
export async function listOrders(opts) {
    const params = undefined;
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.listOrders(params, opts);
    }

    return apiCall("admin", "listOrders", params, opts);
}
export async function toggleAvailability(params, opts) {
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.toggleAvailability(params, opts);
    }

    return apiCall("admin", "toggleAvailability", params, opts);
}
export async function updateOrderStatus(params, opts) {
    if (typeof ENCORE_DROP_TESTS === "undefined" && process.env.NODE_ENV === "test") {
        return TEST_ENDPOINTS.updateOrderStatus(params, opts);
    }

    return apiCall("admin", "updateOrderStatus", params, opts);
}
