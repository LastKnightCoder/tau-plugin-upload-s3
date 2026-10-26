import { definePlugin, type ProviderForm } from "@tau/plugins";
import { upload, validate } from "./upload";

declare const __PLUGIN_META__: { id: string; name: string; version: string };

const form: ProviderForm = {
  groups: [
    {
      title: "账号",
      fields: [
        { key: "accessKeyId", label: "Access Key ID", type: "text" },
        { key: "secretAccessKey", label: "Secret Access Key", type: "secret" },
      ],
    },
    {
      title: "存储位置",
      description: "返回的资源地址须能公开访问；插件不会修改存储桶权限",
      fields: [
        { key: "bucket", label: "Bucket", type: "text", summary: true },
        { key: "region", label: "区域", type: "text", placeholder: "us-east-1", summary: true },
        {
          key: "endpoint",
          label: "服务地址",
          type: "url",
          optional: true,
          description: "兼容 S3 的服务（R2、MinIO 等）填写",
          placeholder: "https://s3.example.com",
        },
        { key: "pathPrefix", label: "目录", type: "text", optional: true, placeholder: "uploads" },
        {
          key: "publicBaseUrl",
          label: "公开地址前缀",
          type: "url",
          optional: true,
          description: "使用自定义域名或 CDN 时填写",
        },
        {
          key: "urlStyle",
          label: "地址模式",
          type: "choice",
          default: "path",
          options: [
            { value: "path", label: "路径模式" },
            { value: "virtualHosted", label: "虚拟主机模式" },
          ],
        },
      ],
    },
  ],
  beforeSave: async values => {
    validate(values);
    return values;
  },
};

export default definePlugin({
  ...__PLUGIN_META__,
  create: () => ({
    activate(context) {
      context.upload.register({
        id: context.pluginId,
        name: __PLUGIN_META__.name,
        upload: (file, config, signal?: AbortSignal) =>
          upload(
            (input, init) => {
              const sourceSignal =
                init?.signal ?? (input instanceof Request ? input.signal : undefined);
              return context.fetch(input, {
                ...init,
                signal: AbortSignal.any([
                  context.signal,
                  ...(signal ? [signal] : []),
                  ...(sourceSignal ? [sourceSignal] : []),
                ]),
              });
            },
            file,
            config
          ),
      });
      context.settings.register({ id: "upload", title: __PLUGIN_META__.name, target: "upload", form });
    },
  }),
});
