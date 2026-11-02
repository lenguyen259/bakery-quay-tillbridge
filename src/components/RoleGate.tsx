import type { DemoRole } from "@/server/policy";

export function RoleGate({
  role,
  allow,
  children,
  fallback,
}: {
  role: DemoRole;
  allow: DemoRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!allow.includes(role)) {
    return fallback ?? null;
  }
  return children;
}
