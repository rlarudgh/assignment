package com.example.assignment.dto.enrollment

import com.example.assignment.domain.Enrollment
import com.example.assignment.domain.EnrollmentStatus
import jakarta.validation.constraints.NotNull

data class CreateEnrollmentRequest(
    @field:NotNull(message = "강의 ID는 필수입니다")
    val courseId: Long,
)

data class EnrollmentResponse(
    val enrollmentId: String,
    val status: String,
    val enrolledAt: String,
    val courseId: String,
    val courseTitle: String,
) {
    companion object {
        fun from(
            enrollment: Enrollment,
            courseTitle: String
        ): EnrollmentResponse =
            EnrollmentResponse(
                enrollmentId = enrollment.id.toString(),
                status = enrollment.status.name.lowercase(),
                enrolledAt = enrollment.enrolledAt.toString(),
                courseId = enrollment.courseId.toString(),
                courseTitle = courseTitle,
            )
    }
}

data class EnrollmentDetailResponse(
    val enrollmentId: String,
    val status: EnrollmentStatus,
    val courseId: String,
    val courseTitle: String,
    val enrolledAt: String,
    val confirmedAt: String?,
    val cancelledAt: String?,
) {
    companion object {
        fun from(
            enrollment: Enrollment,
            courseTitle: String
        ): EnrollmentDetailResponse =
            EnrollmentDetailResponse(
                enrollmentId = enrollment.id.toString(),
                status = enrollment.status,
                courseId = enrollment.courseId.toString(),
                courseTitle = courseTitle,
                enrolledAt = enrollment.enrolledAt.toString(),
                confirmedAt = enrollment.confirmedAt?.toString(),
                cancelledAt = enrollment.cancelledAt?.toString(),
            )
    }
}
