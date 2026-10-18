import type { HttpRequest, HttpHandlerOptions } from "@smithy/types";

/** SDK 负责签名，传输复用宿主 fetch。 */
export function createTransport(fetch: typeof globalThis.fetch) {
  return {
    async handle(request: HttpRequest, options: HttpHandlerOptions = {}) {
      const url = new URL(
        request.protocol +
          "//" +
          request.hostname +
          (request.port ? ":" + request.port : "") +
          request.path,
      );
      for (const [key, value] of Object.entries(request.query ?? {}))
        for (const item of Array.isArray(value) ? value : [value])
          url.searchParams.append(key, item ?? "");
      const headers = new Headers(request.headers);
      headers.delete("host");
      const response = await fetch(url, {
        method: request.method,
        headers,
        body:
          request.body instanceof Uint8Array
            ? new Blob([new Uint8Array(request.body)])
            : request.body,
        signal: options.abortSignal as AbortSignal | undefined,
      });
      return {
        response: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers),
          body: response.body ?? undefined,
        },
      };
    },
  };
}
