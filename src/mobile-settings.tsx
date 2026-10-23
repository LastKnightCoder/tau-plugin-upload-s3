import type { PluginSettingsProps } from "@tau/plugins";
import { ConfigurationPanel, type ConfigurationField } from "@tau/ui";

const accountFields: readonly ConfigurationField[] = [
  {
    key: "accessKeyId",
    label: "Access Key ID",
  },
  {
    key: "secretAccessKey",
    label: "Secret Access Key",
    type: "password",
  },
  {
    key: "endpoint",
    label: "Endpoint",
    placeholder: "可选，自定义 S3 服务地址",
  },
  {
    key: "urlStyle",
    label: "地址模式",
    options: [
      {
        value: "path",
        label: "路径模式",
      },
      {
        value: "virtualHosted",
        label: "虚拟主机模式",
      },
    ],
  },
];
const fields: readonly ConfigurationField[] = [
  {
    key: "bucket",
    label: "Bucket",
    placeholder: "必填",
  },
  {
    key: "region",
    label: "Region",
    placeholder: "例如 ap-southeast-1",
  },
  {
    key: "pathPrefix",
    label: "目录",
    placeholder: "uploads（可选）",
  },
  {
    key: "publicBaseUrl",
    label: "公开地址前缀",
    placeholder: "可选，使用自定义公开域名",
  },
];

export function MobileSettings(props: PluginSettingsProps) {
  const config = props.syncConfig ?? props.uploadConfig;
  if (!config) return <p>请从客户端对应的服务设置进入。</p>;
  const initialValue: Record<string, string> = { urlStyle: "path" };
  if (config.value && typeof config.value === "object" && !Array.isArray(config.value))
    for (const [key, value] of Object.entries(config.value))
      if (typeof value === "string") initialValue[key] = value;
  const preview = (() => {
    try {
      const key = [initialValue.pathPrefix?.replace(/^\/+|\/+$/g, ""), "photo_example.webp"]
        .filter(Boolean)
        .join("/")
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      if (!initialValue.bucket || !initialValue.region) return "";
      if (initialValue.publicBaseUrl)
        return `${initialValue.publicBaseUrl.replace(/\/+$/, "")}/${key}`;
      const endpoint = new URL(
        initialValue.endpoint || `https://s3.${initialValue.region}.amazonaws.com`
      );
      if (initialValue.urlStyle === "virtualHosted") {
        endpoint.hostname = initialValue.bucket + "." + endpoint.hostname;
        return `${endpoint.href.replace(/\/+$/, "")}/${key}`;
      }
      return `${endpoint.href.replace(/\/+$/, "")}/${encodeURIComponent(initialValue.bucket)}/${key}`;
    } catch {
      return "";
    }
  })();
  return (
    <>
      <ConfigurationPanel
        initialValue={initialValue}
        accountFields={accountFields}
        fields={fields}
        onSave={value =>
          config.save({
            ...(config.value && typeof config.value === "object" && !Array.isArray(config.value)
              ? config.value
              : {}),
            ...value,
          })
        }
      />
      {preview && (
        <div className="mt-4 space-y-2 px-4">
          <p className="text-ink-3 text-tau-meta">图片地址示例</p>
          <p className="text-ink-2 text-tau-meta break-all">{preview}</p>
        </div>
      )}
    </>
  );
}
