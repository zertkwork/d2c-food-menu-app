import { CallOpts } from "encore.dev/api";

import {
  StreamInOutHandlerFn,
  StreamInHandlerFn,
  StreamOutHandlerFn,
  StreamOutWithResponse,
  StreamIn,
  StreamInOut,
} from "encore.dev/api";

import { streamOrders as streamOrders_handler } from "../../../../kitchen/stream_orders.js";

type StreamHandshake<Type extends (...args: any[]) => any> = Parameters<Type> extends [infer H, any] ? H : void;

type StreamRequest<Type> = Type extends
  | StreamInOutHandlerFn<any, infer Req, any>
  | StreamInHandlerFn<any, infer Req, any>
  | StreamOutHandlerFn<any, any>
  ? Req
  : never;

type StreamResponse<Type> = Type extends
  | StreamInOutHandlerFn<any, any, infer Resp>
  | StreamInHandlerFn<any, any, infer Resp>
  | StreamOutHandlerFn<any, infer Resp>
  ? Resp
  : never;

type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;
type WithCallOpts<T extends (...args: any) => any> = (
  ...args: [...Parameters<T>, opts?: CallOpts]
) => ReturnType<T>;

import { listOrders as listOrders_handler } from "../../../../kitchen/list_orders.js";
declare const listOrders: WithCallOpts<typeof listOrders_handler>;
export { listOrders };

export function streamOrders(
  ...args: StreamHandshake<typeof streamOrders_handler> extends void
    ? [opts?: CallOpts]
    : [data: StreamHandshake<typeof streamOrders_handler>, opts?: CallOpts]
): Promise<
  StreamIn<
    StreamResponse<typeof streamOrders_handler>
  >
>;
import { updateStatus as updateStatus_handler } from "../../../../kitchen/update_status.js";
declare const updateStatus: WithCallOpts<typeof updateStatus_handler>;
export { updateStatus };


