import { Suspense } from "react";

import { SettingsPage } from "@/components/pages/settings-page";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function SettingsRoutePage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPage />
    </Suspense>
  );
}
