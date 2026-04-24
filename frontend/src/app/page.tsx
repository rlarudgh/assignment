"use client";

import { useAuth } from "@/features/auth/model/auth-context";
import { Skeleton } from "@/shared/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/enrollment");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="h-8 w-32" />
    </div>
  );
}
