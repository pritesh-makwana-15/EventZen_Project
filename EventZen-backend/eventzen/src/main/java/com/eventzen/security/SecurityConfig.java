// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/security/SecurityConfig.java
// CHANGES: FIXED - Added /uploads/** to permitAll() for image access (403 → 200)
// ================================================================

package com.eventzen.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("🔧 Configuring Security Filter Chain...");

        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    System.out.println("🔧 Configuring authorization rules...");
                    auth
                            // ✅ CRITICAL FIX: Allow public access to uploaded images
                            // This MUST be FIRST to prevent 403 errors on image loading
                            .requestMatchers("/uploads/**").permitAll()

                            // Allow OPTIONS requests for CORS preflight
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            // Allow register & login for everyone
                            .requestMatchers("/api/auth/**").permitAll()

                            // Allow public GET access to events (view events without login)
                            .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/**").permitAll()

                            // POST, PUT, DELETE on events require authentication
                            .requestMatchers(HttpMethod.POST, "/api/events/**").hasAnyAuthority("ADMIN", "ORGANIZER")
                            .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyAuthority("ADMIN", "ORGANIZER")
                            .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasAnyAuthority("ADMIN", "ORGANIZER")

                            // Registrations require authentication
                            .requestMatchers("/api/registrations/**").hasAnyAuthority("ADMIN", "VISITOR")

                            // User profile access
                            .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN", "ORGANIZER", "VISITOR")

                            // Admin endpoints
                            .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                            // Any other request needs authentication
                            .anyRequest().authenticated();
                });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        System.out.println("✅ Security Filter Chain configured successfully");
        System.out.println("✅ /uploads/** is now publicly accessible");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend origins
        configuration.setAllowedOrigins(
                Arrays.asList("http://localhost:5173", "http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose Authorization header
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Apply CORS configuration to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}