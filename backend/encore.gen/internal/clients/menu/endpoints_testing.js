import { apiCall, streamIn, streamOut, streamInOut } from "encore.dev/internal/codegen/api";
import { registerTestHandler } from "encore.dev/internal/codegen/appinit";

import * as menu_service from "../../../../menu/encore.service";

export async function list(params, opts) {
    const handler = (await import("../../../../menu/list")).list;
    registerTestHandler({
        apiRoute: { service: "menu", name: "list", raw: false, handler, streamingRequest: false, streamingResponse: false },
        middlewares: menu_service.default.cfg.middlewares || [],
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
    });

    return apiCall("menu", "list", params, opts);
}

