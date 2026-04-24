import { z } from "zod";

export const applicantSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다")
    .max(20, "이름은 20자 이하여야 합니다"),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요")
    .regex(
      /^(01[0-9])-?([0-9]{3,4})-?([0-9]{4})$|^([0-9]{2,3})-?([0-9]{3,4})-?([0-9]{4})$/,
      "올바른 한국 전화번호 형식이 아닙니다 (예: 010-1234-5678)"
    ),
  motivation: z
    .string()
    .max(300, "수강 동기는 300자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
});

export const participantSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일 형식이 아닙니다"),
});

export const groupSchema = z.object({
  organizationName: z.string().min(1, "단첼명을 입력해주세요"),
  headCount: z
    .number()
    .min(2, "단체 신청은 최소 2명 이상이어야 합니다")
    .max(10, "단체 신청은 최대 10명까지 가능합니다"),
  participants: z
    .array(participantSchema)
    .min(2, "최소 2명의 참가자를 입력해주세요")
    .max(10, "최대 10명까지 가능합니다"),
  contactPerson: z.string().min(1, "담당자 연락처를 입력해주세요"),
});

export const step1Schema = z.object({
  courseId: z.string().min(1, "강의를 선택해주세요"),
  type: z.enum(["personal", "group"], {
    required_error: "신청 유형을 선택해주세요",
  }),
});

export const step2PersonalSchema = z.object({
  applicant: applicantSchema,
});

export const step2GroupSchema = z.object({
  applicant: applicantSchema,
  group: groupSchema,
});

export const step3Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해주세요",
  }),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2PersonalFormData = z.infer<typeof step2PersonalSchema>;
export type Step2GroupFormData = z.infer<typeof step2GroupSchema>;
export type Step3FormData = z.infer<typeof step3Schema>;
