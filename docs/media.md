# Editorial media

QALAI has one public `Media` collection for editorial raster images. It is not a document store and
must never contain identity documents, screenshots with personal data, internal drafts or any other
sensitive file.

## Editorial contract

- accepted formats: PNG, JPEG, WebP and AVIF only;
- maximum file size: 3,000,000 bytes;
- a Kazakh alternative text is required and limited to 180 characters;
- every uploaded asset and metadata record is anonymously readable immediately; Media has no draft
  or separate publish state;
- editor, reviewer and admin roles may upload or update assets;
- only an admin may delete an asset;
- bulk upload, remote URL paste, crop controls, focal-point editing and direct browser-to-S3 uploads
  are disabled in the first release.

The server enforces the size limit both for multipart requests and Payload Local API calls. The MIME
whitelist is implemented in Payload and should also be repeated as a bucket-level restriction where
the storage provider supports it.

## Storage modes

`QALAI_MEDIA_STORAGE=local` writes to `.data/media` by default. This path is ignored by Git and is
only for development and tests. Every production build and process refuses to use local mode because
a redeploy could erase the files.

`QALAI_MEDIA_STORAGE=s3` enables Payload's server-side S3 adapter. The schema keeps its `url` and
`prefix` fields in both modes, so moving from local development to hosted storage does not create an
environment-specific database schema.

Required hosted variables:

```dotenv
QALAI_MEDIA_STORAGE=s3
QALAI_MEDIA_S3_BUCKET=qalai-public-media
QALAI_MEDIA_S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
QALAI_MEDIA_S3_REGION=<region shown in Storage settings>
QALAI_MEDIA_S3_ACCESS_KEY_ID=<server-only access key>
QALAI_MEDIA_S3_SECRET_ACCESS_KEY=<server-only secret key>
QALAI_MEDIA_PUBLIC_BASE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/qalai-public-media
```

For Supabase, create a separate public bucket containing only these public editorial images. The S3
access keys are server-only and bypass Storage RLS, so they must never be exposed through a
`NEXT_PUBLIC_` variable or browser bundle. QALAI sends uploads through the server with path-style S3
requests and does not set an object ACL. See Supabase's current
[S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication),
[bucket access model](https://supabase.com/docs/guides/storage/buckets/fundamentals) and
[public URL format](https://supabase.com/docs/guides/storage/serving/downloads) before provisioning.

## Hosted acceptance

Before accepting the closed-alpha host:

1. upload a small PNG through Payload Admin with a Kazakh alternative text;
2. confirm the record URL uses the exact public bucket base and the `qalai/media/` prefix;
3. fetch the URL anonymously and verify `200` plus an image content type;
4. redeploy the same commit and verify the record and identical bytes still exist;
5. confirm SVG, GIF, PDF, missing alternative text and a file over 3 MB are rejected;
6. delete the test asset as an admin and confirm the public URL no longer works.

Database backups do not contain object bytes. Back up the bucket separately. Supabase S3 does not
provide object versioning, and storage deletion is not atomic with the Payload database change. A
failed object deletion can therefore leave an orphan; inspect storage errors and schedule an orphan
reconciliation job before content volume grows.
