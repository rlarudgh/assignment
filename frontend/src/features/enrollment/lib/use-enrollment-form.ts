import type { EnrollmentFormData, EnrollmentResponse, EnrollmentType } from "@/entities/enrollment";
import { EnrollmentError, errorCodeMessages, useSubmitEnrollment } from "@/entities/enrollment";
import { useState } from "react";

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

/**
 * 수강 신청 폼의 상태 관리와 핸들러 로직
 */
export function useEnrollmentForm() {
  const submitEnrollment = useSubmitEnrollment();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>(undefined);
  const [submitSuccess, setSubmitSuccess] = useState<EnrollmentResponse | null>(null);

  const handleStep1Next = (
    formData: EnrollmentFormData,
    setFormData: (
      data: EnrollmentFormData | ((prev: EnrollmentFormData) => EnrollmentFormData)
    ) => void,
    data: { courseId: string; type: EnrollmentType }
  ) => {
    setFormData({
      ...formData,
      courseId: data.courseId,
      type: data.type,
      group: data.type === "personal" ? undefined : formData.group,
    });
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Next = (
    setFormData: (
      data: EnrollmentFormData | ((prev: EnrollmentFormData) => EnrollmentFormData)
    ) => void,
    data: { applicant: typeof defaultFormData.applicant; group?: typeof defaultFormData.group }
  ) => {
    setFormData((prev) => ({
      ...prev,
      applicant: data.applicant,
      group: data.group,
    }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Prev = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep3Prev = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditStep = (step: number) => {
    setSubmitError(null);
    setFieldErrors(undefined);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (formData: EnrollmentFormData, clearDraft: () => void) => {
    try {
      setSubmitError(null);
      setFieldErrors(undefined);

      const response = await submitEnrollment.submit(formData);
      setSubmitSuccess(response);
      clearDraft(); // Clear draft on successful submission
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof EnrollmentError) {
        setSubmitError(errorCodeMessages[err.code] || err.message);
        setFieldErrors(err.details);
      } else {
        setSubmitError("신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleReset = (setFormData: (data: EnrollmentFormData) => void, clearDraft: () => void) => {
    setFormData(defaultFormData);
    setCurrentStep(1);
    setSubmitSuccess(null);
    setSubmitError(null);
    setFieldErrors(undefined);
    clearDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    currentStep,
    submitError,
    fieldErrors,
    submitSuccess,
    handleStep1Next,
    handleStep2Next,
    handleStep2Prev,
    handleStep3Prev,
    handleEditStep,
    handleSubmit,
    handleReset,
  };
}
