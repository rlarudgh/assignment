import { useQuery, useMutation } from "@tanstack/react-query";
import type { 
  Course, 
  CourseListResponse, 
  EnrollmentRequest, 
  EnrollmentResponse, 
  EnrollmentError,
  ErrorResponse 
} from "./enrollment.types";
import { toEnrollmentRequest, EnrollmentError as EnrollmentErrorClass, errorCodeMessages } from "./enrollment.types";
import type { EnrollmentFormData } from "./index";

const API_BASE_URL = "/api";

// Custom fetch error handler
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    throw new EnrollmentErrorClass(
      error.code,
      error.message || errorCodeMessages[error.code] || "알 수 없는 오류가 발생했습니다",
      error.details
    );
  }
  return response.json();
}

// Fetch all courses
async function fetchCourses(category?: string): Promise<CourseListResponse> {
  const params = category && category !== "all" ? `?category=${category}` : "";
  const response = await fetch(`${API_BASE_URL}/courses${params}`);
  return handleResponse(response);
}

// Fetch course by ID
async function fetchCourseById(id: string): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`);
  return handleResponse(response);
}

// Create enrollment with discriminated union type
async function createEnrollment(data: EnrollmentRequest): Promise<EnrollmentResponse> {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// React Query Hooks
export function useCourses(category?: string) {
  return useQuery({
    queryKey: ["courses", category],
    queryFn: () => fetchCourses(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEnrollment() {
  return useMutation({
    mutationFn: createEnrollment,
  });
}

// Helper function to convert form data and submit
export function useSubmitEnrollment() {
  const mutation = useMutation({
    mutationFn: (formData: EnrollmentFormData) => {
      const request = toEnrollmentRequest(formData);
      return createEnrollment(request);
    },
  });

  return mutation;
}

export { toEnrollmentRequest, errorCodeMessages };
export type { EnrollmentError };
