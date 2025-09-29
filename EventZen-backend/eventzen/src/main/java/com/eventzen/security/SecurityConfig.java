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
                // Disable CSRF for APIs
                .csrf(csrf -> csrf.disable())

                // Disable default Spring login page
                .formLogin(form -> form.disable())

                // Disable HTTP Basic authentication
                .httpBasic(basic -> basic.disable())

                // Enable CORS with config
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Use stateless session (JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorize requests
                .authorizeHttpRequests(auth -> {
                    System.out.println("🔧 Configuring authorization rules...");
                    auth
                            // Allow OPTIONS requests for CORS preflight
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            // Allow register & login for everyone (NO AUTHENTICATION REQUIRED)
                            .requestMatchers("/api/auth/**").permitAll()

                            // Role-based access for other APIs
                            .requestMatchers("/api/events/**").hasAnyAuthority("ADMIN", "ORGANIZER", "VISITOR")
                            .requestMatchers("/api/registrations/**").hasAnyAuthority("ADMIN", "VISITOR")

                            // 🔧 FIXED: Include ORGANIZER for user profile access
                            .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN", "ORGANIZER", "VISITOR")

                            .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                            .requestMatchers("/api/admin/**").hasRole("ADMIN")

                            // Any other request needs authentication
                            .anyRequest().authenticated();
                });

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        System.out.println("✅ Security Filter Chain configured successfully");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend URLs - adjust as required
        configuration.setAllowedOrigins(
                Arrays.asList("http://localhost:5173", "http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

        // Allowed headers (Authorization for JWT)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose headers
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Allow sending cookies / credentials
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}