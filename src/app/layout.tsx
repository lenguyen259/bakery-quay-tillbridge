import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { AiModeBanner } from "@/components/AiModeBanner";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Quầy Tillbridge",
  description: "Portfolio demo — CRM, ERP, POS, and bank reconciliation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${beVietnam.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <AiModeBanner />
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <DisclaimerFooter />
      </body>
    </html>
  );
}
