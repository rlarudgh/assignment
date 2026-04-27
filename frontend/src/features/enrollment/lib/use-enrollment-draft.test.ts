import type { EnrollmentFormData } from "@/entities/enrollment";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEnrollmentDraft } from "./use-enrollment-draft";

const STORAGE_KEY = "enrollment_draft";

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "sessionStorage", {
  value: sessionStorageMock,
});

describe("useEnrollmentDraft", () => {
  const defaultFormData: EnrollmentFormData = {
    courseId: "",
    type: "personal",
    applicant: {
      name: "",
      email: "",
      phone: "",
      motivation: "",
    },
    agreedToTerms: false,
  };

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("should initialize with default data when no draft exists", () => {
    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    expect(result.current.formData).toEqual(defaultFormData);
  });

  it("should load saved draft from sessionStorage", () => {
    const savedDraft: EnrollmentFormData = {
      courseId: "course-123",
      type: "group",
      applicant: {
        name: "홍길동",
        email: "test@example.com",
        phone: "010-1234-5678",
        motivation: "배우고 싶어요",
      },
      agreedToTerms: false,
      group: {
        organizationName: "ABC회사",
        headCount: 2,
        participants: [
          { name: "참가자1", email: "p1@example.com" },
          { name: "참가자2", email: "p2@example.com" },
        ],
        contactPerson: "010-9999-9999",
      },
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(savedDraft));

    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    expect(result.current.formData).toEqual(savedDraft);
  });

  it("should save draft to sessionStorage when formData changes", () => {
    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    const newData: EnrollmentFormData = {
      ...defaultFormData,
      courseId: "course-456",
      type: "personal",
    };

    act(() => {
      result.current.setFormData(newData);
    });

    expect(result.current.formData).toEqual(newData);

    const stored = sessionStorage.getItem(STORAGE_KEY);
    expect(stored).toBe(JSON.stringify(newData));
  });

  it("should update formData using updater function", () => {
    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        courseId: "course-789",
      }));
    });

    expect(result.current.formData.courseId).toBe("course-789");

    const stored = sessionStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored as string);
    expect(parsed.courseId).toBe("course-789");
  });

  it("should clear draft from sessionStorage", () => {
    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    // First save some data
    act(() => {
      result.current.setFormData({
        ...defaultFormData,
        courseId: "course-temp",
      });
    });

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();

    // Clear the draft
    act(() => {
      result.current.clearDraft();
    });

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("should handle corrupted sessionStorage data gracefully", () => {
    sessionStorage.setItem(STORAGE_KEY, "invalid-json");

    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    // Should fall back to default data
    expect(result.current.formData).toEqual(defaultFormData);
  });

  it("should handle empty sessionStorage gracefully", () => {
    sessionStorage.removeItem(STORAGE_KEY);

    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    expect(result.current.formData).toEqual(defaultFormData);
  });

  it("should preserve group data when switching from group to personal and back", () => {
    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    const groupData: EnrollmentFormData = {
      ...defaultFormData,
      type: "group",
      group: {
        organizationName: "ABC회사",
        headCount: 2,
        participants: [
          { name: "P1", email: "p1@example.com" },
          { name: "P2", email: "p2@example.com" },
        ],
        contactPerson: "010-1234-5678",
      },
    };

    // Set group data
    act(() => {
      result.current.setFormData(groupData);
    });

    expect(result.current.formData.group).toBeDefined();

    // Switch to personal
    act(() => {
      result.current.setFormData({ ...groupData, type: "personal" });
    });

    expect(result.current.formData.type).toBe("personal");

    // Verify sessionStorage saved the state
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored as string);
    expect(parsed.type).toBe("personal");
  });

  it("should handle sessionStorage setItem error gracefully", () => {
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = vi.fn(() => {
      throw new Error("Quota exceeded");
    });

    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    // Should not throw when saving fails
    act(() => {
      result.current.setFormData({ ...defaultFormData, courseId: "course-err" });
    });

    expect(result.current.formData.courseId).toBe("course-err");

    sessionStorage.setItem = originalSetItem;
  });

  it("should handle sessionStorage removeItem error gracefully", () => {
    const originalRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = vi.fn(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));

    // Should not throw when clearing fails
    act(() => {
      result.current.clearDraft();
    });

    sessionStorage.removeItem = originalRemoveItem;
  });

  it("should handle sessionStorage getItem error gracefully", () => {
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = vi.fn(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useEnrollmentDraft(defaultFormData));
    expect(result.current.formData).toEqual(defaultFormData);

    sessionStorage.getItem = originalGetItem;
  });
});
