import "happy-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { handlers } from "../../shared/api/msw/handlers";
import {
  toEnrollmentRequest,
  useCourse,
  useCourses,
  useSubmitEnrollment,
} from "./enrollment.queries";
import type { EnrollmentFormData } from "./enrollment.types";

const server = setupServer(...handlers);

// Mock Auth context for tests
const MockAuthContext = createContext<{
  getToken: () => string | null;
  handleSessionExpired: () => void;
} | null>(null);

function MockAuthProvider({
  children,
  token = null,
}: {
  children: ReactNode;
  token?: string | null;
}) {
  return (
    <MockAuthContext.Provider
      value={{
        getToken: () => token,
        handleSessionExpired: vi.fn(),
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

// Create a wrapper with QueryClient and AuthProvider
function createWrapper(token?: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockAuthProvider token={token}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MockAuthProvider>
    );
  };
}

// Mock the auth module
vi.mock("@/features/auth/model/auth-context", () => ({
  useAuth: () => useContext(MockAuthContext),
  AuthProvider: MockAuthProvider,
}));

describe("useCourses", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it("should fetch all courses when no category specified", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourses(), { wrapper });

    // Initial state
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.courses).toHaveLength(8);
    expect(result.current.data?.categories).toContain("development");
    expect(result.current.data?.categories).toContain("design");
  });

  it("should fetch courses filtered by category", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourses("development"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.courses).toHaveLength(2);
    expect(result.current.data?.courses[0].category).toBe("development");
  });

  it("should handle empty category result", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourses("nonexistent"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.courses).toHaveLength(0);
  });

  it("should cache data with correct query key", async () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(({ category }) => useCourses(category), {
      wrapper,
      initialProps: { category: undefined as string | undefined },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const firstData = result.current.data;

    // Rerender with same category
    rerender({ category: undefined });

    // Should return cached data immediately
    expect(result.current.data).toBe(firstData);
    expect(result.current.isLoading).toBe(false);
  });
});

describe("useCourse", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it("should fetch course by id", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourse("course-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe("course-1");
    expect(result.current.data?.title).toBe("React 완벽 가이드");
  });

  it("should not fetch when id is empty", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourse(""), { wrapper });

    // Should be idle since enabled is false
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should handle non-existent course", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourse("nonexistent"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useAuthenticatedFetch", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it("should include Authorization header when token exists", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ courses: [], categories: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const wrapper = createWrapper("test-token-123");
    const { result } = renderHook(() => useCourses(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const call = fetchSpy.mock.calls[0];
    const init = call[1] as RequestInit | undefined;
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer test-token-123",
      "Content-Type": "application/json",
    });

    fetchSpy.mockRestore();
  });

  it("should handle 401 Unauthorized", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "UNAUTHORIZED", message: "세션이 만료되었습니다" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCourses(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toContain("세션이 만료되었습니다");
    fetchSpy.mockRestore();
  });
});

describe("useSubmitEnrollment", () => {
  const validFormData: EnrollmentFormData = {
    courseId: "course-1",
    type: "personal",
    applicant: {
      name: "홍길동",
      email: "test@example.com",
      phone: "010-1234-5678",
    },
    agreedToTerms: true,
  };

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it("should submit enrollment successfully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          enrollmentId: "ENR-12345",
          status: "confirmed",
          enrolledAt: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), { wrapper });

    await result.current.submit(validFormData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.enrollmentId).toBe("ENR-12345");
    expect(result.current.data?.status).toBe("confirmed");
  });

  it("should handle validation error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "INVALID_INPUT",
          message: "입력값을 확인해 주세요",
          details: { "applicant.name": "이름을 입력해주세요" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), { wrapper });

    await expect(result.current.submit(validFormData)).rejects.toThrow("입력값을 확인해 주세요");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("입력값을 확인해 주세요");
  });

  it("should handle duplicate enrollment error", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch");
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          enrollmentId: "ENR-1",
          status: "confirmed",
          enrolledAt: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ code: "DUPLICATE_ENROLLMENT", message: "이미 신청한 강의입니다" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      )
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), { wrapper });

    // First submission
    await result.current.submit(validFormData);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Second submission with same email
    const { result: result2 } = renderHook(() => useSubmitEnrollment(), { wrapper });
    await expect(result2.current.submit(validFormData)).rejects.toThrow("이미 신청한 강의입니다");

    await waitFor(() => expect(result2.current.isError).toBe(true));
    expect(result2.current.error?.message).toContain("이미 신청한 강의입니다");
  });

  it("should handle course full error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "COURSE_FULL", message: "정원이 초과되었습니다" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), { wrapper });

    await expect(result.current.submit(validFormData)).rejects.toThrow("정원이 초과되었습니다");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("정원이 초과되었습니다");
  });
});

describe("toEnrollmentRequest integration", () => {
  it("should transform form data to API request correctly", () => {
    const formData: EnrollmentFormData = {
      courseId: "course-2",
      type: "group",
      applicant: {
        name: "홍길동",
        email: "group@example.com",
        phone: "010-1234-5678",
      },
      group: {
        organizationName: "Test Company",
        headCount: 2,
        participants: [
          { name: "User1", email: "user1@example.com" },
          { name: "User2", email: "user2@example.com" },
        ],
        contactPerson: "010-9876-5432",
      },
      agreedToTerms: true,
    };

    const request = toEnrollmentRequest(formData);
    expect(request.type).toBe("group");
    expect(request.group?.headCount).toBe(2);
    expect(request.group?.organizationName).toBe("Test Company");
  });
});
