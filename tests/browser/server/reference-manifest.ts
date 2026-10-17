import "server-only";
import { createHash } from "node:crypto";
import { stable } from "../../../src/lib/answers/catalogue";
import data from "./vision-archive.json";
import type { ReferenceConfiguration } from "../../../src/lib/vision/reference-manifest";

// Only the guarded browser-fixture build aliases this module; production grants stay empty.
export const REFERENCE_CONFIGURATION: ReferenceConfiguration = { version: 1, grants: data.images.map((row) => ({
  imageId: row.id, rowDigest: createHash("sha256").update(stable(row)).digest("hex"), bucket: "fixtures", objectPath: `${row.id}.png`, contentSha256: row.sha256,
  permissionReference: row.license_or_permission_reference, aiProcessing: true, reviewedBy: "Synthetic fixture reviewer", reviewedOn: "2026-10-17",
})) };
