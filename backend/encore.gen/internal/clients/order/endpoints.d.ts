import { CallOpts } from "encore.dev/api";

import {
  StreamInOutHandlerFn,
  StreamInHandlerFn,
  StreamOutHandlerFn,
  StreamOutWithResponse,
  StreamIn,
  StreamInOut,
} from "encore.dev/api";

import { streamStatus as streamStatus_handler } from "../../../../order/stream_status.js";

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

import { create as create_handler } from "../../../../order/create.js";
declare const create: WithCallOpts<typeof create_handler>;
export { create };

export function streamStatus(
  ...args: StreamHandshake<typeof streamStatus_handler> extends void
    ? [opts?: CallOpts]
    : [data: StreamHandshake<typeof streamStatus_handler>, opts?: CallOpts]
): Promise<
  StreamIn<
    StreamResponse<typeof streamStatus_handler>
  >
>;
import { track as track_handler } from "../../../../order/track.js";
declare const track: WithCallOpts<typeof track_handler>;
export { track };

import { webhook as webhook_handler } from "../../../../order/webhook.js";
declare const webhook: WithCallOpts<typeof webhook_handler>;
export { webhook };


