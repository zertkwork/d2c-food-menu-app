import { registerGateways, registerHandlers, run, type Handler } from "encore.dev/internal/codegen/appinit";

import { getAnalytics as admin_getAnalyticsImpl0 } from "../../../../admin/get_analytics";
import { listAllMenu as admin_listAllMenuImpl1 } from "../../../../admin/list_all_menu";
import { listOrders as admin_listOrdersImpl2 } from "../../../../admin/list_orders";
import { toggleAvailability as admin_toggleAvailabilityImpl3 } from "../../../../admin/toggle_availability";
import { updateOrderStatus as admin_updateOrderStatusImpl4 } from "../../../../admin/update_order_status";
import { listOrders as delivery_listOrdersImpl5 } from "../../../../delivery/list_orders";
import { updateStatus as delivery_updateStatusImpl6 } from "../../../../delivery/update_status";
import { listOrders as kitchen_listOrdersImpl7 } from "../../../../kitchen/list_orders";
import { streamOrders as kitchen_streamOrdersImpl8 } from "../../../../kitchen/stream_orders";
import { updateStatus as kitchen_updateStatusImpl9 } from "../../../../kitchen/update_status";
import { list as menu_listImpl10 } from "../../../../menu/list";
import { create as order_createImpl11 } from "../../../../order/create";
import { streamStatus as order_streamStatusImpl12 } from "../../../../order/stream_status";
import { track as order_trackImpl13 } from "../../../../order/track";
import { webhook as order_webhookImpl14 } from "../../../../order/webhook";
import "../../../../kitchen/stream_orders";
import "../../../../kitchen/stream_orders";
import "../../../../order/orchestration";
import "../../../../order/orchestration";
import "../../../../order/stream_status";
import "../../../../order/stream_status";
import "../../../../order/stream_status";
import * as admin_service from "../../../../admin/encore.service";
import * as frontend_service from "../../../../frontend/encore.service";
import * as kitchen_service from "../../../../kitchen/encore.service";
import * as delivery_service from "../../../../delivery/encore.service";
import * as menu_service from "../../../../menu/encore.service";
import * as order_service from "../../../../order/encore.service";

const gateways: any[] = [
];

const handlers: Handler[] = [
    {
        apiRoute: {
            service:           "admin",
            name:              "getAnalytics",
            handler:           admin_getAnalyticsImpl0,
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
            handler:           admin_listAllMenuImpl1,
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
            handler:           admin_listOrdersImpl2,
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
            handler:           admin_toggleAvailabilityImpl3,
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
            handler:           admin_updateOrderStatusImpl4,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: admin_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "delivery",
            name:              "listOrders",
            handler:           delivery_listOrdersImpl5,
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
            handler:           delivery_updateStatusImpl6,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: delivery_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "kitchen",
            name:              "listOrders",
            handler:           kitchen_listOrdersImpl7,
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
            handler:           kitchen_streamOrdersImpl8,
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
            handler:           kitchen_updateStatusImpl9,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: kitchen_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "menu",
            name:              "list",
            handler:           menu_listImpl10,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: menu_service.default.cfg.middlewares || [],
    },
    {
        apiRoute: {
            service:           "order",
            name:              "create",
            handler:           order_createImpl11,
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
            handler:           order_streamStatusImpl12,
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
            handler:           order_trackImpl13,
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
            handler:           order_webhookImpl14,
            raw:               false,
            streamingRequest:  false,
            streamingResponse: false,
        },
        endpointOptions: {"expose":true,"auth":false,"isRaw":false,"isStream":false,"tags":[]},
        middlewares: order_service.default.cfg.middlewares || [],
    },
];

registerGateways(gateways);
registerHandlers(handlers);

await run(import.meta.url);
