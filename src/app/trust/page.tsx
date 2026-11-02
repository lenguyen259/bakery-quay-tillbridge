import { TrustPanel } from "@/components/TrustPanel";

export default function TrustPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Trust</h1>
      <TrustPanel />
      <ul className="list-disc space-y-2 pl-5 text-sm text-cocoa/90">
        <li>Equal invoice amounts stay ambiguous until finance chooses.</li>
        <li>OCR-like bank descriptions need normalized invoice numbers.</li>
        <li>VAT is always computed in code, never in the model prompt.</li>
        <li>Demo mode skips live model calls when no API key is set.</li>
      </ul>
    </div>
  );
}
