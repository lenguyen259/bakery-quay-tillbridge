import { readJsonBody, jsonError, jsonOk } from "@/lib/api";
import { setDemoRole } from "@/app/actions";
import type { DemoRole } from "@/server/policy";

export async function POST(req: Request) {
  const body = await readJsonBody<{ role?: DemoRole }>(req);
  if (!body?.role || !["sales", "finance", "leadership"].includes(body.role)) {
    return jsonError("BAD_REQUEST", "Invalid role", "Vai trò không hợp lệ", 400);
  }
  await setDemoRole(body.role);
  return jsonOk({ role: body.role });
}
