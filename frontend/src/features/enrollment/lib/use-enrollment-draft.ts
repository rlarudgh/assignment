import type { EnrollmentFormData } from "@/entities/enrollment";
import { useState } from "react";

const STORAGE_KEY = "enrollment_draft";

// sessionStorage 유틸
const loadDraftFromStorage = (): EnrollmentFormData | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as EnrollmentFormData) : null;
  } catch {
    return null;
  }
};

const saveDraftToStorage = (data: EnrollmentFormData) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
};

const clearDraftFromStorage = () => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

/**
 * 수강 신청 폼의 임시 저장 기능 (sessionStorage)
 * - formData가 변경될 때마다 자동 저장
 * - 페이지 새로고침 시 데이터 복구
 * - 제출 완료/초기화 시 정리
 */
export function useEnrollmentDraft(defaultFormData: EnrollmentFormData) {
  const [formData, setFormData] = useState<EnrollmentFormData>(() => {
    const draft = loadDraftFromStorage();
    return draft || defaultFormData;
  });

  // Auto-save formData to sessionStorage whenever it changes
  const setFormDataWithSave = (
    data: EnrollmentFormData | ((prev: EnrollmentFormData) => EnrollmentFormData)
  ) => {
    setFormData((prev) => {
      const newData =
        typeof data === "function"
          ? (data as (prev: EnrollmentFormData) => EnrollmentFormData)(prev)
          : data;
      saveDraftToStorage(newData);
      return newData;
    });
  };

  // Clear draft (call on submit success or reset)
  const clearDraft = () => {
    clearDraftFromStorage();
  };

  return {
    formData,
    setFormData: setFormDataWithSave,
    clearDraft,
  };
}
