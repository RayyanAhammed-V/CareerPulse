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
        // Handle preflight CORS requests
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (tokenProvider.validateToken(token)) {
                String role = tokenProvider.getRoleFromJWT(token);
                request.setAttribute("userId", tokenProvider.getUserIdFromJWT(token));
                request.setAttribute("userRole", role);
                
                String path = request.getRequestURI();
                if (path.startsWith("/api/faculty") && !"FACULTY".equals(role) && !"ADMIN".equals(role)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
                if (path.startsWith("/api/recruiter") && !"RECRUITER".equals(role) && !"ADMIN".equals(role)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
                if (path.startsWith("/api/admin") && !"ADMIN".equals(role)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
                if (path.startsWith("/api/profile") && !"STUDENT".equals(role)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }

                return true;
            }
        }
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return false;
    }
}
