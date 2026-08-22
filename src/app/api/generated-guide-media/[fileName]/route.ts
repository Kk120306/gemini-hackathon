import { NextResponse } from "next/server";

import { serverEnv } from "@/config/env";
import { LocalMediaStore } from "@/storage/local-media-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await context.params;
  const media = await new LocalMediaStore(
    serverEnv.ANCHOR_DATA_DIR,
  ).readGeneratedGuideImage(fileName);
  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(media.bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": media.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
