import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { JsonValue, UploadFile } from "@tau/plugins";
import { readConfig, objectKey, publicUrl } from "./config";
import { createTransport } from "./transport";

export function validate(value: JsonValue) {
  const config = readConfig(value, [
    "accessKeyId",
    "secretAccessKey",
    "bucket",
    "region",
  ]);
  if (
    config.endpoint &&
    !["http:", "https:"].includes(new URL(config.endpoint).protocol)
  )
    throw new Error("Endpoint 必须为 HTTP(S) 地址");
  return config;
}

export async function upload(
  fetch: typeof globalThis.fetch,
  file: UploadFile,
  value: JsonValue,
): Promise<string> {
  const config = validate(value);
  const key = objectKey(config.pathPrefix, file.name);
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    forcePathStyle: config.urlStyle !== "virtualHosted",
    requestHandler: createTransport(fetch),
  });
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: file.content,
        ContentType: file.mimeType || "application/octet-stream",
      }),
    );
    if (config.publicBaseUrl) return publicUrl(config.publicBaseUrl, key);
    const endpoint = new URL(
      config.endpoint || `https://s3.${config.region}.amazonaws.com`,
    );
    if (config.urlStyle === "virtualHosted") {
      endpoint.hostname = config.bucket + "." + endpoint.hostname;
      return publicUrl(endpoint.href, key);
    }
    return publicUrl(endpoint.href, config.bucket + "/" + key);
  } finally {
    client.destroy();
  }
}
