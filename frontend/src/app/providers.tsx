"use client";

import { AuthProvider } from "@/features/auth/model/auth-context";
import { Toaster } from "@/shared/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    // Initialize MSW in development when MOCK_MODE is enabled
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

    if (process.env.NODE_ENV === "development" && isMockMode) {
      import("@/shared/api/msw/browser")
        .then(({ worker }) => {
          worker.start({
            onUnhandledRequest: "bypass",
          });
          // MSW started successfully
        })
        .catch((err) => {
          console.error("MSW initialization failed:", err);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
