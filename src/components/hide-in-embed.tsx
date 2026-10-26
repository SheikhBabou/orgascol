"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Inner({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  if (params.get("embed") === "1") return null;
  return <>{children}</>;
}

export default function HideInEmbed({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <Inner>{children}</Inner>
    </Suspense>
  );
}
