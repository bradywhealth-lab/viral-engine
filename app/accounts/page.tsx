import { Suspense } from "react";

import { AccountsPage } from "@/components/pages/accounts-page";
import { Skeleton } from "@/components/ui/skeleton";

function AccountsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function AccountsRoutePage() {
  return (
    <Suspense fallback={<AccountsPageSkeleton />}>
      <AccountsPage />
    </Suspense>
  );
}
