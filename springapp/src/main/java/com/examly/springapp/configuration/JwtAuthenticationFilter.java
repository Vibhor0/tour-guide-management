package com.examly.springapp.configuration;
 
import com.nimbusds.jwt.SignedJWT;
import com.examly.springapp.utils.UserUtils;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${spring.security.oauth2.resourceserver.jwt.secret-key}")
    private String secret; 

    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/user/login")
            || path.startsWith("/api/user/register")
            || path.startsWith("/api/user/token/validate")
            || path.startsWith("/v3/api-docs")
            || path.startsWith("/swagger-ui");
    }


    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/user/login") || path.startsWith("/api/user/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (bearer == null || bearer.isBlank() || !bearer.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        

        try {
            boolean valid = UserUtils.isTokenValid(bearer, secret);
            if (!valid) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;
            }

            String token = UserUtils.extractToken(bearer);
            SignedJWT jwt = SignedJWT.parse(token);
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            String username = claims.getStringClaim("username");
            String role = claims.getStringClaim("role");

            if (username != null && role != null) {
                role = role.trim().toUpperCase(java.util.Locale.ROOT);
                
                var authorities = java.util.List.of(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)
                );

                
                var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    username, null, authorities
                );

                org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);

            }
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}