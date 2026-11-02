import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(
  code: string,
  message_en: string,
  message_vi: string,
  status: number,
) {
  return NextResponse.json(
    { ok: false, error: { code, message_en, message_vi } },
    { status },
  );
}

export async function readJsonBody<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
