"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/auth") {
      setChecked(true);
      return;
    }

    // Client-side auth check as a second layer (server middleware handles the real check)
    const authFlag = localStorage.getItem("vev-auth");
    if (!authFlag) {
      router.replace("/auth");
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;
  if (pathname === "/auth") return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
