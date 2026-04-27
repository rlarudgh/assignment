import type { EnrollmentFormData } from "@/entities/enrollment";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEnrollmentForm } from "./use-enrollment-form";

// Mock dependencies
const mockSubmit = vi.fn();

vi.mock("@/entities/enrollment", () => ({
  useSubmitEnrollment: () => ({
    submit: mockSubmit,
  }),
  EnrollmentError: class extends Error {
    constructor(
      public code: string,
      message: string,
      public details?: Record<string, string>
    ) {
      super(message);
      this.name = "EnrollmentError";
    }
  },
  errorCodeMessages: {
    DUPLICATE_ENROLLMENT: "이미 신청한 강의입니다",
    COURSE_FULL: "정원이 마감되었습니다",
    INVALID_COURSE: "존재하지 않는 강의입니다",
    UNKNOWN: "알 수 없는 오류입니다",
  },
}));

describe("useEnrollmentForm", () => {
  const mockFormData: EnrollmentFormData = {
    courseId: "course-123",
    type: "personal",
    applicant: {
      name: "홍길동",
      email: "test@example.com",
      phone: "010-1234-5678",
      motivation: "",
    },
    agreedToTerms: false,
  };

  const mockSetFormData = vi.fn();
  const mockClearDraft = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with step 1 and no errors", () => {
    const { result } = renderHook(() => useEnrollmentForm());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.submitError).toBeNull();
    expect(result.current.fieldErrors).toBeUndefined();
    expect(result.current.submitSuccess).toBeNull();
  });

  describe("handleStep1Next", () => {
    it("should update formData and move to step 2 for personal enrollment", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      act(() => {
        result.current.handleStep1Next(mockFormData, mockSetFormData, {
          courseId: "new-course",
          type: "personal",
        });
      });

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockFormData,
        courseId: "new-course",
        type: "personal",
        group: undefined,
      });
      expect(result.current.currentStep).toBe(2);
    });

    it("should update formData and move to step 2 for group enrollment", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      const groupFormData: EnrollmentFormData = {
        ...mockFormData,
        type: "group",
        group: {
          organizationName: "ABC회사",
          headCount: 2,
          participants: [
            { name: "참가자1", email: "p1@example.com" },
            { name: "참가자2", email: "p2@example.com" },
          ],
          contactPerson: "010-1234-5678",
        },
      };

      act(() => {
        result.current.handleStep1Next(groupFormData, mockSetFormData, {
          courseId: "new-course",
          type: "group",
        });
      });

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...groupFormData,
        courseId: "new-course",
        type: "group",
        group: groupFormData.group,
      });
      expect(result.current.currentStep).toBe(2);
    });
  });

  describe("handleStep2Next", () => {
    it("should update applicant data and move to step 3", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      const applicantData = {
        applicant: {
          name: "이름",
          email: "email@test.com",
          phone: "010-1234-5678",
          motivation: "동기",
        },
      };

      act(() => {
        result.current.handleStep2Next(mockSetFormData, applicantData);
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
      expect(result.current.currentStep).toBe(3);
    });
  });

  describe("handleStep2Prev", () => {
    it("should move to step 1", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      // First move to step 2
      act(() => {
        result.current.handleStep1Next(mockFormData, mockSetFormData, {
          courseId: "course-1",
          type: "personal",
        });
      });

      expect(result.current.currentStep).toBe(2);

      // Then move back to step 1
      act(() => {
        result.current.handleStep2Prev();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe("handleStep3Prev", () => {
    it("should move to step 2", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      // Move to step 3
      act(() => {
        result.current.handleStep1Next(mockFormData, mockSetFormData, {
          courseId: "course-1",
          type: "personal",
        });
        result.current.handleStep2Next(mockSetFormData, {
          applicant: mockFormData.applicant,
        });
      });

      expect(result.current.currentStep).toBe(3);

      // Then move back to step 2
      act(() => {
        result.current.handleStep3Prev();
      });

      expect(result.current.currentStep).toBe(2);
    });
  });

  describe("handleEditStep", () => {
    it("should clear errors and move to specified step", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      // Set some errors first
      act(() => {
        result.current.handleEditStep(2);
      });

      expect(result.current.submitError).toBeNull();
      expect(result.current.fieldErrors).toBeUndefined();
      expect(result.current.currentStep).toBe(2);
    });
  });

  describe("handleReset", () => {
    it("should reset all state and clear draft", () => {
      const { result } = renderHook(() => useEnrollmentForm());

      // Move to step 3
      act(() => {
        result.current.handleStep1Next(mockFormData, mockSetFormData, {
          courseId: "course-1",
          type: "personal",
        });
        result.current.handleStep2Next(mockSetFormData, {
          applicant: mockFormData.applicant,
        });
      });

      expect(result.current.currentStep).toBe(3);

      // Reset
      act(() => {
        result.current.handleReset(mockSetFormData, mockClearDraft);
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.submitSuccess).toBeNull();
      expect(result.current.submitError).toBeNull();
      expect(result.current.fieldErrors).toBeUndefined();
      expect(mockSetFormData).toHaveBeenCalled();
      expect(mockClearDraft).toHaveBeenCalled();
    });
  });

  describe("handleSubmit", () => {
    it("should submit successfully and set success state", async () => {
      const mockResponse = {
        enrollmentId: "ENR-123",
        status: "confirmed",
        enrolledAt: new Date().toISOString(),
      };
      mockSubmit.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useEnrollmentForm());

      await act(async () => {
        await result.current.handleSubmit(mockFormData, mockClearDraft);
      });

      expect(result.current.submitSuccess).toEqual(mockResponse);
      expect(result.current.submitError).toBeNull();
      expect(mockClearDraft).toHaveBeenCalled();
    });

    it("should handle EnrollmentError with details", async () => {
      const { EnrollmentError } = await import("@/entities/enrollment");
      const error = new EnrollmentError("DUPLICATE_ENROLLMENT", "이미 신청한 강의입니다", {
        email: "중복된 이메일입니다",
      });
      mockSubmit.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useEnrollmentForm());

      await act(async () => {
        await result.current.handleSubmit(mockFormData, mockClearDraft);
      });

      expect(result.current.submitError).toBe("이미 신청한 강의입니다");
      expect(result.current.fieldErrors).toEqual({ email: "중복된 이메일입니다" });
      expect(result.current.submitSuccess).toBeNull();
    });

    it("should handle unknown errors", async () => {
      mockSubmit.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useEnrollmentForm());

      await act(async () => {
        await result.current.handleSubmit(mockFormData, mockClearDraft);
      });

      expect(result.current.submitError).toBe(
        "신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요."
      );
      expect(result.current.submitSuccess).toBeNull();
    });
  });
});
