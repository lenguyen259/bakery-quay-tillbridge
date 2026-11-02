import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canReadAudit } from "@/server/policy";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getDemoRole();
  if (!canReadAudit(role)) {
    return jsonError("FORBIDDEN", "Not allowed", "Không được phép", 403);
  }
  const events = await prisma.auditEvent.findMany({
    orderBy: { at: "desc" },
    take: 30,
  });
  const mapped =
    role === "leadership"
      ? events.map(({ detail, ...rest }) => {
          const d = detail as Record<string, unknown>;
          const { redacted_input: _r, ...safeDetail } = d;
          void _r;
          return { ...rest, detail: safeDetail };
        })
      : events;
  return jsonOk(mapped);
}
