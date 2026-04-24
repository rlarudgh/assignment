package com.example.assignment.dto.auth

import com.example.assignment.domain.User
import com.example.assignment.domain.UserRole

data class LoginRequest(
    val email: String,
    val password: String,
)

data class LoginResponse(
    val token: String,
    val user: UserResponse,
)

data class UserResponse(
    val id: String,
    val email: String,
    val name: String,
    val role: UserRole,
) {
    companion object {
        fun from(user: User): UserResponse =
            UserResponse(
                id = user.id.toString(),
                email = user.email,
                name = user.name,
                role = user.role,
            )
    }
}
