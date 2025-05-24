package com.datainsights.portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    // Serve React app for all non-API routes
    @GetMapping(value = {
            "/",
            "/dashboard",
            "/dashboard/**",
            "/login",
            "/register",
            "/profile/**",
            "/analytics/**",
            "/budget/**",
            "/goals/**",
            "/reports/**",
            "/transactions/**",
            "/settings/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}