package com.example.assignment.controller

import com.example.assignment.dto.auth.LoginRequest
import com.example.assignment.dto.auth.LoginResponse
import com.example.assignment.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "인증 API")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/login")
    @Operation(summary = "로그인")
    fun login(
        @RequestBody @Valid request: LoginRequest
    ): ResponseEntity<LoginResponse> {
        return ResponseEntity.ok(authService.login(request))
    }

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회")
    fun getMe(authentication: Authentication?): ResponseEntity<Any> {
        if (authentication == null) {
            return ResponseEntity.status(401)
                .body(mapOf("code" to "UNAUTHORIZED", "message" to "로그인이 필요합니다"))
        }
        val userId = authentication.principal as Long
        return ResponseEntity.ok(mapOf("user" to authService.getUser(userId)))
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃")
    fun logout(): ResponseEntity<Any> {
        return ResponseEntity.ok(mapOf("success" to true))
    }
}
