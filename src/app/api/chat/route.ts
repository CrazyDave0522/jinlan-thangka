import { isChatRequest } from "@/lib/chat/conversation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const valid = isChatRequest(body);
  return Response.json(
    { error: { code: valid ? "generation_unavailable" : "invalid_request" } },
    { status: valid ? 503 : 400, headers: { "Cache-Control": "no-store" } },
  );
}
