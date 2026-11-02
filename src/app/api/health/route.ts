import { prisma } from "@/lib/db";
import { aiHealth } from "@/lib/ai/client";

export const dynamic = "force-dynamic";

export async function GET() {
  let db: "up" | "down" = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch {
    db = "down";
  }
  return Response.json({ ok: true, db, ai: aiHealth() });
}
