package com.example.assignment.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
) {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() } // JWT 기반 인증이므로 CSRF 비활성화 (STATELESS 세션)
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // 공개 엔드포인트만 명시적으로 허용
                    .requestMatchers("/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/signup").permitAll()
                    .requestMatchers("/api/auth/me").permitAll()
                    .requestMatchers("/api/courses").permitAll()
                    .requestMatchers("/api/courses/**").permitAll()
                    // Swagger는 개발 환경에서만 허용
                    .requestMatchers("/swagger-ui/**").permitAll()
                    .requestMatchers("/v3/api-docs/**").permitAll()
                    .requestMatchers("/*.html").permitAll()
                    // 나머지 API는 인증 필요
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll()
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
