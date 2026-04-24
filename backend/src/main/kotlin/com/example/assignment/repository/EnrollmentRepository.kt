package com.example.assignment.repository

import com.example.assignment.domain.Enrollment
import com.example.assignment.domain.EnrollmentStatus
import org.springframework.data.jpa.repository.JpaRepository

interface EnrollmentRepository : JpaRepository<Enrollment, Long> {
    fun countByCourseIdAndStatusNot(
        courseId: Long,
        status: EnrollmentStatus
    ): Long

    fun existsByCourseIdAndUserId(
        courseId: Long,
        userId: Long
    ): Boolean

    fun findAllByUserId(userId: Long): List<Enrollment>

    fun findAllByCourseId(courseId: Long): List<Enrollment>

    fun findAllByCourseIdAndStatus(
        courseId: Long,
        status: EnrollmentStatus
    ): List<Enrollment>
}
