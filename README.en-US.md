# S3 Asset Upload

When you insert images, audio, video, or attachments into a note, they are automatically uploaded to S3-compatible storage (such as AWS S3, Cloudflare R2, or MinIO), leaving a direct link in the note. Images continue to display properly when you publish to a blog or share with others.

## Getting Started

1. Install **S3 Asset Upload** from the Plugin Center, then enable it under **Installed** on the Plugins page.
2. Open **Settings** on the plugin details page.
3. Fill in **Access Key ID**, **Secret Access Key**, **Bucket**, and **Region**. The key requires write permissions, and the bucket must be created beforehand. For S3-compatible services such as R2 or MinIO, also fill in **Service URL**. If your provider requires a specific **URL style**, select it according to their documentation. **Directory** is optional.
4. Save your settings, select this service under **Settings → Resource storage**, and test by inserting an image into a note: if it appears in the note and opens in a browser, you are all set.

To use your own domain or CDN, enter it in **Public URL prefix** so generated links use that prefix. Image compression follows Tau's **Compress uploads** toggle.

## FAQ

**Upload failed?** Check your account, bucket, and network connection. Failed uploads never silently fall back to another location.

**Upload succeeded, but the link will not open?** The bucket usually does not allow public read access, or the custom domain is misconfigured. The plugin does not change bucket permissions; update them in your provider's console.

**Nothing happens when inserting images in a separate window?** Keep the main Tau window open and confirm the plugin is enabled.

**Can this sync my notes?** No. This plugin only uploads attachments; use a sync plugin to sync your library.

## Notes

- Works on desktop and mobile. If you also use the sync plugin, sync and upload credentials are configured separately and do not affect each other.
- Your access keys are the keys to your storage. Never share them with others or include them in screenshots or issue reports.
