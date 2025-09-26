package com.eventzen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files at /files/** URL pattern
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:uploads/");

        System.out.println("✅ Static file handler configured: /files/** -> file:uploads/");
    }
}