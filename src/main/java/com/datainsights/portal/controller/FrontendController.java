package com.datainsights.portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    // Serve React app for the root path and all frontend routes
    @GetMapping(value = {
            "/",
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
    public String home() {
        return "forward:/index.html";
    }
}