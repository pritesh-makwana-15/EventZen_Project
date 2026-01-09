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
                            // ✅ CRITICAL: Public access to uploaded images
                            .requestMatchers("/uploads/**").permitAll()

                            // ✅ Allow OPTIONS for CORS
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            // ✅ Allow register & login
                            .requestMatchers("/api/auth/**").permitAll()

                            // 🆕 NEW: Visitor ticket endpoints - VISITOR only
                            .requestMatchers("/api/visitor/registrations/*/ticket/**")
                            .hasAuthority("ROLE_VISITOR")

                            // ✅ CRITICAL FIX: Allow VISITOR to register for events
                            .requestMatchers(HttpMethod.POST, "/api/events/*/register")
                            .authenticated()

                            // ✅ Public GET access to events
                            .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/**").permitAll()

                            // ✅ Organizer Calendar endpoint - ORGANIZER only
                            .requestMatchers(HttpMethod.GET, "/api/events/organizer/calendar")
                            .hasAuthority("ROLE_ORGANIZER")

                            // ✅ Organizer ticket preview - ORGANIZER only
                            .requestMatchers("/api/organizer/events/*/ticket/preview")
                            .hasAuthority("ROLE_ORGANIZER")

                            // ✅ Event CRUD - ORGANIZER/ADMIN only
                            .requestMatchers(HttpMethod.POST, "/api/events")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                            .requestMatchers(HttpMethod.PUT, "/api/events/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")
                            .requestMatchers(HttpMethod.DELETE, "/api/events/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_ORGANIZER")

                            // ✅ Registrations - VISITOR/ADMIN
                            .requestMatchers("/api/registrations/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_VISITOR")

                            // ✅ User profile - authenticated
                            .requestMatchers("/api/users/**").authenticated()

                            // ✅ Admin endpoints - ADMIN only
                            .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                            .requestMatchers("/api/events/admin/**").hasAuthority("ROLE_ADMIN")

                            // ✅ Everything else needs auth
                            .anyRequest().authenticated();
                });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        System.out.println("✅ Security configured");
        System.out.println("✅ /api/visitor/registrations/*/ticket/** → ROLE_VISITOR");
        System.out.println("✅ /api/organizer/events/*/ticket/preview → ROLE_ORGANIZER");
        System.out.println("✅ All other existing routes preserved");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.asList("http://localhost:5173", "http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}