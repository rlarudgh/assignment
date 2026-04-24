package com.example.assignment.controller

import com.example.assignment.dto.enrollment.CreateEnrollmentRequest
import com.example.assignment.dto.enrollment.EnrollmentDetailResponse
import com.example.assignment.dto.enrollment.EnrollmentResponse
import com.example.assignment.exception.UnauthorizedException
import com.example.assignment.service.EnrollmentService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/enrollments")
@Tag(name = "Enrollments", description = "수강 신청 API")
class EnrollmentController(
    private val enrollmentService: EnrollmentService,
) {
    @PostMapping
    @Operation(summary = "수강 신청")
    fun enroll(
        authentication: Authentication?,
        @RequestBody @Valid request: CreateEnrollmentRequest,
    ): ResponseEntity<EnrollmentResponse> {
        val userId = extractUserId(authentication)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(enrollmentService.enroll(userId, request))
    }

    @GetMapping
    @Operation(summary = "내 수강 신청 목록")
    fun getMyEnrollments(authentication: Authentication?): ResponseEntity<List<EnrollmentDetailResponse>> {
        val userId = extractUserId(authentication)
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(userId))
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "결제 확정")
    fun confirmEnrollment(
        @PathVariable id: Long,
        authentication: Authentication?,
    ): ResponseEntity<EnrollmentResponse> {
        val userId = extractUserId(authentication)
        return ResponseEntity.ok(enrollmentService.confirmEnrollment(id, userId))
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "수강 취소")
    fun cancelEnrollment(
        @PathVariable id: Long,
        authentication: Authentication?,
    ): ResponseEntity<EnrollmentResponse> {
        val userId = extractUserId(authentication)
        return ResponseEntity.ok(enrollmentService.cancelEnrollment(id, userId))
    }

    private fun extractUserId(authentication: Authentication?): Long {
        if (authentication == null) {
            throw UnauthorizedException("로그인이 필요합니다")
        }
        return authentication.principal as Long
    }
}
