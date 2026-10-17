import "server-only";

export type ReferenceGrant = { imageId: string; rowDigest: string; bucket: string; objectPath: string;
  contentSha256: string; permissionReference: string; aiProcessing: true; reviewedBy: string; reviewedOn: string };
export type ReferenceConfiguration = { version: 1; grants: ReferenceGrant[] };

// Add a grant only after reviewing the current row, original bytes and AI-processing permission.
export const REFERENCE_CONFIGURATION: ReferenceConfiguration = { version: 1, grants: [] };
