"use client";

import { AuthProvider } from "@/features/auth/model/auth-context";
import { Toaster } from "@/shared/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactQueryDevtoolsLazy = process.env.NODE_ENV === "development"
  ? dynamic(
    () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
    { ssr: false },
  )
  : () => null;

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

    if (process.env.NODE_ENV === "development" && isMockMode) {
      import("@/shared/api/msw/browser")
        .then(({ worker }) => {
          worker.start({ onUnhandledRequest: "bypass" });
        })
        .catch((err) => {
          console.error("MSW initialization failed:", err);
        });
    }

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtoolsLazy />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
