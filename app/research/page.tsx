import { Suspense } from "react";

import { ResearchPage } from "@/components/pages/research-page";
import { Skeleton } from "@/components/ui/skeleton";

function ResearchPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function ResearchRoutePage() {
  return (
    <Suspense fallback={<ResearchPageSkeleton />}>
      <ResearchPage />
    </Suspense>
  );
}
