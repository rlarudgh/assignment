"use client";

import { useAuth } from "@/features/auth/model/auth-context";
import { Skeleton } from "@/shared/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "CREATOR" | "CLASSMATE";
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, requireRole, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다");
      router.push("/login");
      return;
    }

    if (requireRole && !hasRole(requireRole)) {
      toast.error("접근 권한이 없습니다");
      router.push("/enrollment");
    }
  }, [isAuthenticated, isLoading, requireRole, hasRole, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireRole && !hasRole(requireRole)) {
    return null;
  }

  return <>{children}</>;
}
