// Runtime descriptors follow database/schema.sql and have been compared with live-generated types.
// Keep this validation metadata in sync when regenerating database.generated.ts.
export type { Database, Json } from "./database.generated";

export const archiveColumns = {
  artists: {
    id: { kind: "uuid", nullable: false },
    display_name: { kind: "text", nullable: false },
    name_bo: { kind: "text", nullable: true },
    name_en: { kind: "text", nullable: true },
    aliases: { kind: "text[]", nullable: false },
    gender: { kind: "text", nullable: true },
    birth_period_text: { kind: "text", nullable: true },
    death_period_text: { kind: "text", nullable: true },
    region_text: { kind: "text", nullable: true },
    styles: { kind: "text[]", nullable: false },
    institutions: { kind: "text[]", nullable: false },
    teachers_text: { kind: "text", nullable: true },
    active_period_text: { kind: "text", nullable: true },
    biography: { kind: "text", nullable: true },
    official_url: { kind: "text", nullable: true },
    collected_by: { kind: "text", nullable: true },
    collected_on: { kind: "date", nullable: true },
    review_status: { kind: "text", nullable: true },
    notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
    content_revision: { kind: "integer", nullable: false },
    current_review_id: { kind: "uuid", nullable: true },
  },
  artworks: {
    id: { kind: "uuid", nullable: false },
    title: { kind: "text", nullable: false },
    title_bo: { kind: "text", nullable: true },
    title_en: { kind: "text", nullable: true },
    alternative_titles: { kind: "text[]", nullable: false },
    attribution_status: { kind: "text", nullable: false },
    attribution_notes: { kind: "text", nullable: true },
    creation_period_text: { kind: "text", nullable: true },
    creation_year_start: { kind: "integer", nullable: true },
    creation_year_end: { kind: "integer", nullable: true },
    dating_notes: { kind: "text", nullable: true },
    styles: { kind: "text[]", nullable: false },
    subject_primary: { kind: "text", nullable: true },
    subject_details: { kind: "text", nullable: true },
    iconography_notes: { kind: "text", nullable: true },
    materials_text: { kind: "text", nullable: true },
    technique_text: { kind: "text", nullable: true },
    height_cm: { kind: "numeric", nullable: true },
    width_cm: { kind: "numeric", nullable: true },
    dimensions_notes: { kind: "text", nullable: true },
    collection_name: { kind: "text", nullable: true },
    accession_number: { kind: "text", nullable: true },
    collection_location: { kind: "text", nullable: true },
    provenance_notes: { kind: "text", nullable: true },
    description: { kind: "text", nullable: true },
    collected_by: { kind: "text", nullable: true },
    collected_on: { kind: "date", nullable: true },
    review_status: { kind: "text", nullable: true },
    notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
    content_revision: { kind: "integer", nullable: false },
    current_review_id: { kind: "uuid", nullable: true },
  },
  sources: {
    id: { kind: "uuid", nullable: false },
    title: { kind: "text", nullable: false },
    source_type: { kind: "text", nullable: true },
    author_or_organization: { kind: "text", nullable: true },
    publication_year: { kind: "integer", nullable: true },
    publisher_or_journal: { kind: "text", nullable: true },
    edition_text: { kind: "text", nullable: true },
    url: { kind: "text", nullable: true },
    doi_or_isbn: { kind: "text", nullable: true },
    locator_notes: { kind: "text", nullable: true },
    accessed_on: { kind: "date", nullable: true },
    supports_notes: { kind: "text", nullable: true },
    reliability_notes: { kind: "text", nullable: true },
    rights_notes: { kind: "text", nullable: true },
    collected_by: { kind: "text", nullable: true },
    notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
  },
  images: {
    id: { kind: "uuid", nullable: false },
    artwork_id: { kind: "uuid", nullable: false },
    storage_locator: { kind: "text", nullable: false },
    image_type: { kind: "text", nullable: true },
    is_primary: { kind: "boolean", nullable: false },
    caption: { kind: "text", nullable: true },
    photographer_or_provider: { kind: "text", nullable: true },
    rights_status: { kind: "text", nullable: false },
    license_or_permission_reference: { kind: "text", nullable: true },
    permission_notes: { kind: "text", nullable: true },
    quality_notes: { kind: "text", nullable: true },
    sha256: { kind: "text", nullable: true },
    pixel_width: { kind: "integer", nullable: true },
    pixel_height: { kind: "integer", nullable: true },
    mime_type: { kind: "text", nullable: true },
    byte_size: { kind: "bigint", nullable: true },
    collected_by: { kind: "text", nullable: true },
    collected_on: { kind: "date", nullable: true },
    review_status: { kind: "text", nullable: true },
    notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
    content_revision: { kind: "integer", nullable: false },
    current_review_id: { kind: "uuid", nullable: true },
  },
  artwork_artists: {
    artwork_id: { kind: "uuid", nullable: false },
    artist_id: { kind: "uuid", nullable: false },
    role: { kind: "text", nullable: false },
    attribution_status: { kind: "text", nullable: false },
    attribution_notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
  },
  artist_sources: {
    id: { kind: "uuid", nullable: false },
    artist_id: { kind: "uuid", nullable: false },
    source_id: { kind: "uuid", nullable: false },
    supported_field: { kind: "text", nullable: false },
    locator: { kind: "text", nullable: false },
    evidence_notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
  },
  artwork_sources: {
    id: { kind: "uuid", nullable: false },
    artwork_id: { kind: "uuid", nullable: false },
    source_id: { kind: "uuid", nullable: false },
    supported_field: { kind: "text", nullable: false },
    locator: { kind: "text", nullable: false },
    evidence_notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
  },
  image_sources: {
    id: { kind: "uuid", nullable: false },
    image_id: { kind: "uuid", nullable: false },
    source_id: { kind: "uuid", nullable: false },
    supported_field: { kind: "text", nullable: false },
    locator: { kind: "text", nullable: false },
    evidence_notes: { kind: "text", nullable: true },
    created_at: { kind: "timestamptz", nullable: false },
    updated_at: { kind: "timestamptz", nullable: false },
  },
} as const;

export function isArchiveReviewField(field: string) {
  return field === "content_revision" || field === "current_review_id";
}

export const archiveEnums = {
  "artists.gender": ["male", "female", "other", "not_stated"],
  "artists.review_status": ["pending", "verified", "disputed"],
  "artworks.review_status": ["pending", "verified", "disputed"],
  "images.review_status": ["pending", "verified", "disputed"],
  "artworks.attribution_status": ["not_recorded", "confirmed", "attributed", "workshop", "circle_or_school", "unknown", "disputed"],
  "artwork_artists.attribution_status": ["not_recorded", "confirmed", "attributed", "disputed"],
  "artwork_artists.role": ["creator", "collaborator", "workshop_of", "circle_of", "other"],
  "images.image_type": ["full", "detail", "inscription", "back", "mounting", "other"],
  "images.rights_status": ["pending", "public_domain", "authorized", "open_license", "copyrighted"],
  "sources.source_type": ["institution_archive", "book", "paper", "webpage", "interview", "other"],
} as const;

export type ArchiveTable = keyof typeof archiveColumns;
type ColumnValue<C> = C extends { kind: infer K; nullable: infer N }
  ? (K extends "integer" | "numeric" | "bigint" ? number
    : K extends "boolean" ? boolean : K extends "text[]" ? string[] : string)
    | (N extends true ? null : never) : never;
type CheckedValue<T extends ArchiveTable, K extends keyof typeof archiveColumns[T]> =
  `${T}.${K & string}` extends keyof typeof archiveEnums
    ? (typeof archiveEnums)[`${T}.${K & string}`][number]
      | (typeof archiveColumns[T][K] extends { nullable: true } ? null : never)
    : ColumnValue<typeof archiveColumns[T][K]>;
export type ArchiveTransportRow<T extends ArchiveTable> = {
  -readonly [K in keyof typeof archiveColumns[T]]: ColumnValue<typeof archiveColumns[T][K]>
};
export type ArchiveRow<T extends ArchiveTable> = {
  [K in keyof typeof archiveColumns[T]]: CheckedValue<T, K>
};
export type ArtistRow = ArchiveRow<"artists">;
export type ArtworkRow = ArchiveRow<"artworks">;
export type ImageRow = ArchiveRow<"images">;
export type SourceRow = ArchiveRow<"sources">;
export type ArtworkArtistRow = ArchiveRow<"artwork_artists">;
export type EvidenceLink =
  | { entity: "artist"; entityId: string; row: ArchiveRow<"artist_sources"> }
  | { entity: "artwork"; entityId: string; row: ArchiveRow<"artwork_sources"> }
  | { entity: "image"; entityId: string; row: ArchiveRow<"image_sources"> };
