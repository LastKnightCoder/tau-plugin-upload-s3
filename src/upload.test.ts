import { expect, it, vi } from "vitest";
import { upload } from "./upload";
const config = {
  accessKeyId: "test-only",
  secretAccessKey: "test-only",
  bucket: "test-bucket",
  region: "us-east-1",
  endpoint: "https://s3.test",
  pathPrefix: "images",
};
const file = {
  name: "a b.png",
  mimeType: "image/png",
  content: new Uint8Array([0, 255]),
};
it.each(["path", "virtualHosted"])(
  "实际SDK签名上传，保留%s地址风格和MIME",
  async (urlStyle) => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response("", { status: 200 }));
    const url = await upload(fetch, file, { ...config, urlStyle });
    expect(url).toBe(
      urlStyle === "path"
        ? "https://s3.test/test-bucket/images/a%20b.png"
        : "https://test-bucket.s3.test/images/a%20b.png",
    );
    const request = fetch.mock.calls[0][1]!;
    const headers = new Headers(request.headers);
    expect(headers.get("authorization")).toContain("AWS4-HMAC-SHA256");
    expect(headers.get("content-type")).toBe("image/png");
    expect(headers.has("x-amz-acl")).toBe(false);
    expect(
      new Uint8Array(await new Response(request.body).arrayBuffer()),
    ).toEqual(file.content);
  },
);
it("自定义公开域名与上传端点分离，错误继续抛出", async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(new Response(""));
  await expect(
    upload(fetch, file, { ...config, publicBaseUrl: "https://cdn.test" }),
  ).resolves.toBe("https://cdn.test/images/a%20b.png");
  fetch.mockResolvedValue(
    new Response("<Error><Code>AccessDenied</Code></Error>", { status: 403 }),
  );
  await expect(upload(fetch, file, config)).rejects.toThrow();
});
