import { generateObject } from "ai";
import { createLlmProvider, getAiModelId } from "@/lib/ai/provider";
import { z } from "zod";
import {
  demoExplanationBl77,
  demoExplanationBl80,
  demoInvoiceNarrationSo200,
  demoShiftNoteNh,
  explanationSchema,
} from "./demo-fixtures";
import {
  validateInvoiceNarrationSo200,
  validateReconcileExplanation,
  validateShiftCloseNote,
} from "./grounding";

export type AiMode = "demo" | "live" | "fallback";

const rateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  rateMap.set(key, hits);
  return true;
}

function resolveDemoMode(): "demo" | "live" {
  const mode = process.env.AI_DEMO_MODE ?? "auto";
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (mode === "on") return "demo";
  if (mode === "off") return "live";
  return hasKey ? "live" : "demo";
}

export function aiHealth(): "configured" | "demo" {
  return resolveDemoMode() === "live" ? "configured" : "demo";
}

export async function narrateInvoiceSo200(): Promise<{
  narration_en: string;
  narration_vi: string;
  mode: AiMode;
  flags: string[];
}> {
  if (!checkRateLimit("narrate-invoice")) {
    const fix = demoInvoiceNarrationSo200();
    return { ...fix, mode: "fallback", flags: ["RATE_LIMIT"] };
  }
  if (resolveDemoMode() === "demo") {
    return { ...demoInvoiceNarrationSo200(), mode: "demo", flags: [] };
  }
  try {
    const llm = createLlmProvider();
    const schema = z.object({
      narration_en: z.string(),
      narration_vi: z.string(),
    });
    const { object } = await generateObject({
      model: llm(getAiModelId()),
      schema,
      prompt:
        "Write bilingual invoice narration for year-end gift boxes (order so-200). Mention delivery before 15 Dec and the 30 Oct visit note. Do not state invoice totals, VAT amounts, unit prices, or discount percentages.",
    });
    if (!validateInvoiceNarrationSo200(object.narration_en, object.narration_vi)) {
      const fix = demoInvoiceNarrationSo200();
      return { ...fix, mode: "fallback", flags: ["MODEL_NUMBER_DRIFT"] };
    }
    return { ...object, mode: "live", flags: [] };
  } catch {
    return { ...demoInvoiceNarrationSo200(), mode: "fallback", flags: [] };
  }
}

export async function explainReconcile(
  bankLineId: string,
  candidates: string[],
): Promise<{
  explanation_en: string;
  explanation_vi: string;
  mode: AiMode;
  flags: string[];
}> {
  if (!checkRateLimit("explain-reconcile")) {
    const fix =
      bankLineId === "bl-77" ? demoExplanationBl77() : demoExplanationBl80();
    return { ...fix, mode: "fallback", flags: ["RATE_LIMIT"] };
  }
  const fixture =
    bankLineId === "bl-77" ? demoExplanationBl77() : demoExplanationBl80();
  if (resolveDemoMode() === "demo") {
    return { ...fixture, mode: "demo", flags: [] };
  }
  try {
    const llm = createLlmProvider();
    const { object } = await generateObject({
      model: llm(getAiModelId()),
      schema: explanationSchema,
      prompt: `Explain bank match candidates ${candidates.join(", ")} for line ${bankLineId}. Do not pick a single winner when more than one candidate is listed; say a finance user must choose.`,
    });
    const drift = object.cited_invoice_numbers.some(
      (n) => !candidates.includes(n),
    );
    const grounded = validateReconcileExplanation(
      bankLineId,
      candidates,
      object.explanation_en,
      object.explanation_vi,
      object.cited_invoice_numbers,
    );
    if (drift || !grounded) {
      return {
        explanation_en: fixture.explanation_en,
        explanation_vi: fixture.explanation_vi,
        mode: "fallback",
        flags: drift ? ["MODEL_NUMBER_DRIFT"] : ["MODEL_GROUNDING"],
      };
    }
    return {
      explanation_en: object.explanation_en,
      explanation_vi: object.explanation_vi,
      mode: "live",
      flags: [],
    };
  } catch {
    return { ...fixture, mode: "fallback", flags: [] };
  }
}

export async function shiftCloseNote(
  redactedInput: Record<string, unknown>,
): Promise<{ note_en: string; note_vi: string; mode: AiMode }> {
  if (!checkRateLimit("shift-close")) {
    return { ...demoShiftNoteNh(), mode: "fallback" };
  }
  if (resolveDemoMode() === "demo") {
    return { ...demoShiftNoteNh(), mode: "demo" };
  }
  try {
    const llm = createLlmProvider();
    const schema = z.object({ note_en: z.string(), note_vi: z.string() });
    const { object } = await generateObject({
      model: llm(getAiModelId()),
      schema,
      prompt: `Summarize shift close facts in plain language. Cite the break amount exactly. Do not invent customer tax codes or phone numbers: ${JSON.stringify(redactedInput)}`,
    });
    const breakVnd =
      typeof redactedInput.break_vnd === "number"
        ? redactedInput.break_vnd
        : 45000;
    if (
      !validateShiftCloseNote(
        object.note_en,
        object.note_vi,
        breakVnd,
        redactedInput,
      )
    ) {
      return { ...demoShiftNoteNh(), mode: "fallback" };
    }
    return { ...object, mode: "live" };
  } catch {
    return { ...demoShiftNoteNh(), mode: "fallback" };
  }
}
