package com.example.assignment.repository

import com.example.assignment.domain.Course
import com.example.assignment.domain.CourseStatus
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import java.util.Optional

interface CourseRepository : JpaRepository<Course, Long> {
    fun findAllByStatus(status: CourseStatus): List<Course>

    fun findAllByStatusAndCategory(
        status: CourseStatus,
        category: String
    ): List<Course>

    fun findAllByInstructorId(instructorId: Long): List<Course>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Course c WHERE c.id = :id")
    fun findWithLockById(id: Long): Optional<Course>
}
