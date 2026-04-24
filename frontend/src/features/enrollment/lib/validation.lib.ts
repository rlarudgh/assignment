import { z } from "zod";

// Custom error messages
const required = (field: string) => `${field}을(를) 입력해주세요`;
const minLength = (field: string, min: number) => `${field}은(는) ${min}자 이상이어야 합니다`;
const maxLength = (field: string, max: number) => `${field}은(는) ${max}자 이하여야 합니다`;

// Applicant validation
export const applicantSchema = z.object({
  name: z
    .string()
    .min(1, required("이름"))
    .min(2, minLength("이름", 2))
    .max(20, maxLength("이름", 20)),
  email: z.string().min(1, required("이메일")).email("올바른 이메일 형식이 아닙니다"),
  phone: z
    .string()
    .min(1, required("전화번호"))
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "올바른 휴전화번호 형식이 아닙니다 (예: 010-1234-5678)"),
  motivation: z.string().max(300, maxLength("수강 동기", 300)).optional().or(z.literal("")),
});

// Participant validation (for group enrollment)
export const participantSchema = z.object({
  name: z.string().min(1, required("이름")),
  email: z.string().min(1, required("이메일")).email("올바른 이메일 형식이 아닙니다"),
});

// Group info validation
export const groupSchema = z.object({
  organizationName: z.string().min(1, required("단첼명")),
  headCount: z
    .number({
      required_error: required("신청 인원"),
      invalid_type_error: "숫자를 입력해주세요",
    })
    .min(2, "단체 신청은 최소 2명 이상이어야 합니다")
    .max(10, "단체 신청은 최대 10명까지 가능합니다"),
  participants: z
    .array(participantSchema)
    .min(2, "최소 2명의 참가자를 입력해주세요")
    .max(10, "최대 10명까지 가능합니다"),
  contactPerson: z.string().min(1, required("담당자 연락처")),
});

// Step 1: Course selection
export const step1Schema = z.object({
  courseId: z.string().min(1, "강의를 선택해주세요"),
  type: z.enum(["personal", "group"], {
    required_error: "신청 유형을 선택해주세요",
    invalid_type_error: "올바른 신청 유형을 선택해주세요",
  }),
});

// Step 2: Applicant info (personal)
export const step2PersonalSchema = z.object({
  applicant: applicantSchema,
});

// Step 2: Applicant info (group)
export const step2GroupSchema = z.object({
  applicant: applicantSchema,
  group: groupSchema,
});

// Step 3: Agreement
export const step3Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해주세요",
  }),
});

// API Request validation schemas
export const personalEnrollmentRequestSchema = z.object({
  courseId: z.string().min(1, required("강의")),
  type: z.literal("personal"),
  applicant: applicantSchema,
  agreedToTerms: z.literal(true),
});

export const groupEnrollmentRequestSchema = z.object({
  courseId: z.string().min(1, required("강의")),
  type: z.literal("group"),
  applicant: applicantSchema,
  group: groupSchema,
  agreedToTerms: z.literal(true),
});

// Unified enrollment request schema
export const enrollmentRequestSchema = z.discriminatedUnion("type", [
  personalEnrollmentRequestSchema,
  groupEnrollmentRequestSchema,
]);

// Login validation
export const loginSchema = z.object({
  email: z.string().min(1, required("이메일")).email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, required("비밀번호")),
});

// Type exports
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2PersonalFormData = z.infer<typeof step2PersonalSchema>;
export type Step2GroupFormData = z.infer<typeof step2GroupSchema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type PersonalEnrollmentRequest = z.infer<typeof personalEnrollmentRequestSchema>;
export type GroupEnrollmentRequest = z.infer<typeof groupEnrollmentRequestSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Helper function to format Zod errors
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
}
