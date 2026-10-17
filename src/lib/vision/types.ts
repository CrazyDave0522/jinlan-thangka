import type { AnswerReference } from "@/lib/answers/contracts";
import type { NormalizedArchiveQuery } from "@/lib/retrieval/contracts";

export type Descriptor = { id: string; ownerMessageId: string; displayIndex: number;
  mimeType: "image/jpeg" | "image/png"; width: number; height: number; sha256: string };
export type ContextMessage = { id: string; role: "user" | "assistant"; text: string; imageIds: string[] };
export type SelectedInput = { imageId: string; data: string };
export type Intent = { kind: "question" } | { kind: "reread"; sourceTurnId: string; sourceAssistantId: string; imageIds: string[] };
export type ImageRequest = { version: 2; turnId: string; messages: ContextMessage[]; images: Descriptor[];
  inputs: SelectedInput[]; observations: Observation[]; sameWorkSets: string[][]; intent: Intent };
export const REGIONS = ["whole", "top_left", "top_center", "top_right", "middle_left", "center", "middle_right", "bottom_left", "bottom_center", "bottom_right"] as const;
export type Region = typeof REGIONS[number];
export type ObservationBody = { imageId: string; facts: { text: string; region: Region }[];
  readings: { text: string; region: Region; kind: "collection" | "accession" | "inscription" | "other"; certainty: "clear" | "tentative" | "unreadable" }[];
  interpretations: { text: string; certainty: "tentative" | "clear" }[];
  limitations: { text: string; affectsIdentity: boolean }[] };
export type Observation = ObservationBody & { id: string; imageSha256: string; originTurnId: string;
  originAssistantId: string; pass: "analysis" | "verification"; supersedes: string | null };
export type Group = { id: string; imageIds: string[]; representativeImageId: string | null;
  task: "interpret" | "identify" | "compare"; search: "not_requested" | "no_clue" | "planned" };
export type BoundQuery = { query: NormalizedArchiveQuery; groupIds: string[] };
export type Plan = { action: "answer"; observations: ObservationBody[]; groups: Group[]; queries: BoundQuery[] }
  | { action: "clarify"; question: string } | { action: "needs_image"; imageIds: string[] };
export type Block = { kind: "visual" | "archive" | "general"; text: string; evidenceKeys: string[]; observationIds: string[] };
export type FeatureProof = { evidenceKey: string; quote: string; kind: "composition" | "local_detail" | "inscription" | "condition";
  finding: "match" | "mismatch"; visitorRegion: Region; referenceRegion: Region };
export type Comparison = { taskId: string; assessment: "same_work" | "different_work" | "uncertain";
  proofs: FeatureProof[]; contradictions: string[] };
export type GeneratedAnswer = { blocks: Block[]; comparisons: Comparison[]; observationUpdates: ObservationBody[] };
export const REASONS = ["no_clue", "record_unverified", "source_support_missing", "identifier_unclear", "identifier_mismatch", "identity_conflict", "candidate_limit", "references_missing", "reference_not_authorized", "reference_limit", "visual_uncertain", "insufficient_features"] as const;
export type Reason = typeof REASONS[number];
export type Identity = { status: "not_requested" | "no_match" }
  | { status: "candidates" | "insufficient_evidence"; reasons: Reason[] }
  | { status: "identified"; method: "identifier" | "reference"; artworkId: string; supportingImageIds: string[]; evidenceKeys: string[]; referenceKeys: string[] };
export type GroupResult = { id: string; imageIds: string[]; searchStatus: "not_searched" | "no_matches" | "matched";
  candidates: { artworkId: string; label: string }[]; candidateLimitReached: boolean; identity: Identity };
export type ReferenceEvidence = { key: string; imageId: string; artworkId: string; contentSha256: string };
export type VerificationTask = { id: string; groupId: string; artworkId: string; referenceKey: string; visitorImageId: string };
export type PublicComparison = Comparison & Omit<VerificationTask, "id">;
export type RereadAction = { sourceTurnId: string; sourceAssistantId: string; imageIds: string[] };
export const VISION_NOTICES = ["no_retrieval", "no_matches", "record_only", "candidate_limit", "uncertain_records", "image_interpretation", "prior_observations", "reference_compared", "reference_limited"] as const;
export type VisionNotice = typeof VISION_NOTICES[number];
export type Assistant = { id: string; role: "assistant"; text: string; notices: VisionNotice[]; blocks: Block[];
  references: AnswerReference[]; observations: Observation[]; groups: GroupResult[];
  referenceImages: ReferenceEvidence[]; comparisons: PublicComparison[] } &
  ({ kind: "answer"; reread: null } | { kind: "clarification"; question: string; reread: RereadAction | null });
export type Success = { version: 2; turnId: string; message: Assistant };
