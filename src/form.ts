import { messages } from "./i18n";
import type { ProviderFormDeclaration } from "@tau/plugins";
import { validate } from "./upload";

export const form: ProviderFormDeclaration = {
  groups: [
    {
      title: messages.ref("account.title"),
      fields: [
        { key: "accessKeyId", label: messages.ref("account.accessKey"), type: "text" },
        { key: "secretAccessKey", label: messages.ref("account.secret"), type: "secret" },
      ],
    },
    {
      title: messages.ref("location.title"),
      description: messages.ref("location.publicHint"),
      fields: [
        { key: "bucket", label: messages.ref("location.bucket"), type: "text", summary: true },
        {
          key: "region",
          label: messages.ref("location.region"),
          type: "text",
          placeholder: "us-east-1",
          summary: true,
        },
        {
          key: "endpoint",
          label: messages.ref("location.endpoint"),
          type: "url",
          optional: true,
          description: messages.ref("location.endpointHint"),
          placeholder: "https://s3.example.com",
        },
        {
          key: "pathPrefix",
          label: messages.ref("location.path"),
          type: "text",
          optional: true,
          placeholder: "uploads",
        },
        {
          key: "publicBaseUrl",
          label: messages.ref("location.publicBase"),
          type: "url",
          optional: true,
          description: messages.ref("location.publicBaseHint"),
        },
        {
          key: "urlStyle",
          label: messages.ref("style.label"),
          type: "choice",
          default: "path",
          options: [
            {
              value: "path",
              label: messages.ref("style.path"),
              description: messages.ref("style.pathHint"),
            },
            {
              value: "virtualHosted",
              label: messages.ref("style.virtual"),
              description: messages.ref("style.virtualHint"),
            },
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
