"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/auth" || pathname.startsWith("/auth/")) {
      setChecked(true);
      return;
    }

    // Verify session via API
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          localStorage.setItem("vev-auth", "1");
          setChecked(true);
        } else {
          // Also check legacy localStorage flag (middleware handles the real check)
          const authFlag = localStorage.getItem("vev-auth");
          if (!authFlag) {
            router.replace("/auth");
          } else {
            setChecked(true);
          }
        }
      })
      .catch(() => {
        // Network error — fall back to localStorage check
        const authFlag = localStorage.getItem("vev-auth");
        if (!authFlag) {
          router.replace("/auth");
        } else {
          setChecked(true);
        }
      });
  }, [pathname, router]);

  if (!checked) return null;
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
