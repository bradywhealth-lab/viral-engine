"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = useMemo(() => pathname === "/auth" || pathname.startsWith("/auth/"), [pathname]);
  const [checked, setChecked] = useState(isAuthRoute);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    let cancelled = false;

    void fetch("/api/auth/me")
      .then((res) => {
        if (cancelled) return;

        if (res.ok) {
          localStorage.setItem("vev-auth", "1");
          setChecked(true);
          return;
        }

        localStorage.removeItem("vev-auth");
        router.replace("/auth");
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("vev-auth");
        router.replace("/auth");
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthRoute, router]);

  if (!isAuthRoute && !checked) return null;
  if (isAuthRoute) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
