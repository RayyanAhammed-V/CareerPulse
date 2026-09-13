package com.example.demo.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (tokenProvider.validateToken(token)) {
                Long userId = tokenProvider.getUserIdFromJWT(token);
                String role = tokenProvider.getRoleFromJWT(token);
                String email = tokenProvider.getEmailFromJWT(token);

                request.setAttribute("userId", userId);
                request.setAttribute("userRole", role);
                request.setAttribute("userEmail", email);

                String path = request.getRequestURI();
                String normRole = role != null ? role.replace("ROLE_", "").toUpperCase() : "";

                // RBAC checks
                if (path.startsWith("/api/admin")) {
                    if (!"ADMIN".equals(normRole)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\": \"Forbidden: Admin access required\"}");
                        return false;
                    }
                } else if (path.startsWith("/api/faculty")) {
                    if (!"FACULTY".equals(normRole) && !"ADMIN".equals(normRole)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\": \"Forbidden: Faculty access required\"}");
                        return false;
                    }
                } else if (path.startsWith("/api/recruiter")) {
                    if (!"RECRUITER".equals(normRole) && !"ADMIN".equals(normRole)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\": \"Forbidden: Recruiter access required\"}");
                        return false;
                    }
                } else if (path.startsWith("/api/students/me")) {
                    if (!"STUDENT".equals(normRole) && !"ADMIN".equals(normRole)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\": \"Forbidden: Student access required\"}");
                        return false;
                    }
                }

                return true;
            }
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Unauthorized: Please log in\"}");
        return false;
    }
}
