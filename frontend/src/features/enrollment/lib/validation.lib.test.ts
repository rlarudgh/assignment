import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  applicantSchema,
  step1Schema,
  step2PersonalSchema,
  step2GroupSchema,
  step3Schema,
  enrollmentRequestSchema,
  loginSchema,
  formatZodErrors,
} from "./validation.lib";

describe("validation.lib", () => {
  describe("applicantSchema", () => {
    it("should validate valid applicant data", () => {
      const validData = {
        name: "홍길동",
        email: "test@example.com",
        phone: "010-1234-5678",
        motivation: "배우고 싶습니다",
      };

      const result = applicantSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        email: "test@example.com",
        phone: "010-1234-5678",
      };

      const result = applicantSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("이름");
      }
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        name: "홍",
        email: "test@example.com",
        phone: "010-1234-5678",
      };

      const result = applicantSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        name: "홍길동",
        email: "invalid-email",
        phone: "010-1234-5678",
      };

      const result = applicantSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("이메일");
      }
    });

    it("should reject invalid phone format", () => {
      const invalidData = {
        name: "홍길동",
        email: "test@example.com",
        phone: "02-1234-5678",
      };

      const result = applicantSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("휴전화");
      }
    });

    it("should accept empty motivation as optional", () => {
      const validData = {
        name: "홍길동",
        email: "test@example.com",
        phone: "010-1234-5678",
        motivation: "",
      };

      const result = applicantSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("step1Schema", () => {
    it("should validate valid course selection", () => {
      const validData = {
        courseId: "course-123",
        type: "personal" as const,
      };

      const result = step1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty courseId", () => {
      const invalidData = {
        courseId: "",
        type: "personal" as const,
      };

      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const invalidData = {
        courseId: "course-123",
        type: "invalid",
      };

      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("step2PersonalSchema", () => {
    it("should validate valid personal enrollment", () => {
      const validData = {
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
      };

      const result = step2PersonalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid applicant data", () => {
      const invalidData = {
        applicant: {
          name: "",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
      };

      const result = step2PersonalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("step2GroupSchema", () => {
    it("should validate valid group enrollment", () => {
      const validData = {
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
        group: {
          organizationName: "ABC회사",
          headCount: 3,
          participants: [
            { name: "참가자1", email: "p1@example.com" },
            { name: "참가자2", email: "p2@example.com" },
            { name: "참가자3", email: "p3@example.com" },
          ],
          contactPerson: "010-1234-5678",
        },
      };

      const result = step2GroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject group with less than 2 participants", () => {
      const invalidData = {
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
        group: {
          organizationName: "ABC회사",
          headCount: 1,
          participants: [{ name: "참가자1", email: "p1@example.com" }],
          contactPerson: "010-1234-5678",
        },
      };

      const result = step2GroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject group with more than 10 participants", () => {
      const invalidData = {
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
        group: {
          organizationName: "ABC회사",
          headCount: 11,
          participants: Array.from({ length: 11 }, (_, i) => ({
            name: `참가자${i + 1}`,
            email: `p${i}@example.com`,
          })),
          contactPerson: "010-1234-5678",
        },
      };

      const result = step2GroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("step3Schema", () => {
    it("should validate when agreed to terms", () => {
      const validData = {
        agreedToTerms: true,
      };

      const result = step3Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when not agreed to terms", () => {
      const invalidData = {
        agreedToTerms: false,
      };

      const result = step3Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("enrollmentRequestSchema", () => {
    it("should validate valid personal enrollment request", () => {
      const validData = {
        courseId: "course-123",
        type: "personal" as const,
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
        agreedToTerms: true,
      };

      const result = enrollmentRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate valid group enrollment request", () => {
      const validData = {
        courseId: "course-123",
        type: "group" as const,
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
        group: {
          organizationName: "ABC회사",
          headCount: 2,
          participants: [
            { name: "참가자1", email: "p1@example.com" },
            { name: "참가자2", email: "p2@example.com" },
          ],
          contactPerson: "010-1234-5678",
        },
        agreedToTerms: true,
      };

      const result = enrollmentRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject enrollment without terms agreement", () => {
      const invalidData = {
        courseId: "course-123",
        type: "personal" as const,
        applicant: {
          name: "홍길동",
          email: "test@example.com",
          phone: "010-1234-5678",
        },
        agreedToTerms: false,
      };

      const result = enrollmentRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("formatZodErrors", () => {
    it("should format Zod errors correctly", () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      const result = schema.safeParse({ name: "A", email: "invalid" });
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveProperty("name");
        expect(formatted).toHaveProperty("email");
        expect(Object.keys(formatted)).toHaveLength(2);
      }
    });

    it("should handle nested field paths", () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(2),
        }),
      });

      const result = schema.safeParse({ user: { name: "A" } });
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveProperty("user.name");
      }
    });
  });
});
