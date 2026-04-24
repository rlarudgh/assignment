package com.example.assignment.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "courses")
class Course(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(nullable = false)
    val title: String,
    @Column(columnDefinition = "TEXT")
    val description: String = "",
    @Column(nullable = false)
    val price: Int = 0,
    @Column(name = "max_capacity", nullable = false)
    val maxCapacity: Int,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: CourseStatus = CourseStatus.DRAFT,
    @Column(name = "start_date", nullable = false)
    val startDate: LocalDate,
    @Column(name = "end_date", nullable = false)
    val endDate: LocalDate,
    @Column(name = "instructor_id", nullable = false)
    val instructorId: Long,
    @Column
    val category: String = "development",
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)

enum class CourseStatus {
    DRAFT,
    OPEN,
    CLOSED,
}
