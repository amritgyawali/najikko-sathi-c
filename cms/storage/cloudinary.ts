import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import { v2 as cloudinary } from "cloudinary";

/** Store originals and Payload's resized images without using Vercel's disk. */
export function cloudinaryStorage(connectionString: string) {
  let connection: URL;
  try {
    connection = new URL(connectionString);
  } catch {
    throw new Error("CLOUDINARY_URL must be a valid Cloudinary connection string.");
  }
  if (
    connection.protocol !== "cloudinary:" ||
    !connection.hostname ||
    !connection.username ||
    !connection.password
  ) {
    throw new Error("CLOUDINARY_URL must include the API key, API secret, and cloud name.");
  }

  const credentials = {
    cloud_name: connection.hostname,
    api_key: decodeURIComponent(connection.username),
    api_secret: decodeURIComponent(connection.password),
    secure: true,
  };

  const asset = (filename: string) => {
    const extension = path.extname(filename).toLowerCase();
    const resourceType: "raw" | "image" = extension === ".pdf" ? "raw" : "image";
    // Hash the whole filename so different extensions and Unicode names cannot
    // collide or be interpreted as Cloudinary transformation parameters.
    const id = createHash("sha256").update(filename).digest("hex");
    const publicId = `najikko-sathi/media/${id}${resourceType === "raw" ? extension : ""}`;
    const url = cloudinary.url(publicId, {
      cloud_name: credentials.cloud_name,
      secure: true,
      resource_type: resourceType,
      type: "upload",
      ...(resourceType === "image" && extension ? { format: extension.slice(1) } : {}),
    });
    return { publicId, resourceType, url };
  };

  const adapter: Adapter = () => ({
    name: "cloudinary",
    generateURL: ({ filename }) => asset(filename).url,
    async handleUpload({ file }) {
      const target = asset(file.filename);
      const buffer = file.tempFilePath ? await readFile(file.tempFilePath) : file.buffer;
      await new Promise<void>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            ...credentials,
            public_id: target.publicId,
            resource_type: target.resourceType,
            overwrite: true,
            invalidate: true,
            timeout: 60_000,
          },
          (error, result) => {
            if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
            else if (!result) reject(new Error("Cloudinary returned no upload result."));
            else resolve();
          },
        );
        stream.on("error", reject);
        stream.end(buffer);
      });
    },
    async handleDelete({ filename }) {
      const target = asset(filename);
      await cloudinary.uploader.destroy(target.publicId, {
        ...credentials,
        resource_type: target.resourceType,
        invalidate: true,
      });
    },
    staticHandler: (_req, { params }) => Response.redirect(asset(params.filename).url, 302),
  });

  return cloudStoragePlugin({
    collections: {
      media: {
        adapter,
        disableLocalStorage: true,
        // Media already has public read access in the collection config.
        disablePayloadAccessControl: true,
      },
    },
  });
}
