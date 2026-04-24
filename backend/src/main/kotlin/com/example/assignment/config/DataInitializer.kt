package com.example.assignment.config

import com.example.assignment.domain.UserRole
import com.example.assignment.service.AuthService
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
class DataInitializer {
    private val log = LoggerFactory.getLogger(javaClass)

    @Bean
    @Profile("dev")
    fun initSeedData(authService: AuthService): CommandLineRunner {
        return CommandLineRunner {
            seedIfAbsent("creator@test.com", "크리에이터", "password123", UserRole.CREATOR, authService)
            seedIfAbsent("student@test.com", "수강생", "password123", UserRole.CLASSMATE, authService)
        }
    }

    private fun seedIfAbsent(
        email: String,
        name: String,
        password: String,
        role: UserRole,
        authService: AuthService
    ) {
        try {
            authService.signup(email, name, password, role)
            log.info("Seed account created: {} ({})", email, role.name)
        } catch (_: Exception) {
            log.info("Seed account already exists: {}", email)
        }
    }
}
