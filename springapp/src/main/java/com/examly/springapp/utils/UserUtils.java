package com.examly.springapp.utils;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;              
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;       
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.common.util.StringUtils;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

public class UserUtils {

    private UserUtils() {
    }

    public static String encrypt(String password) {
        return Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8));
    }

    public static String decrypt(String password) {
        return new String(Base64.getDecoder().decode(password), StandardCharsets.UTF_8);
    }

    public static String generateToken(String username, String role, String secret) throws Exception {
        JWSSigner signer = new MACSigner(secret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date exp = new Date(System.currentTimeMillis() + 60 * 60 * 1000); 

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject("JWT Authentication")
                .claim("username", username)
                .claim("role", role)
                .issueTime(now)
                .expirationTime(exp)
                .build();

        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
        signedJWT.sign(signer);
        return signedJWT.serialize();
    }

    public static String extractToken(String bearerToken) {
        if (StringUtils.isEmpty(bearerToken)) {
            return null;
        }
        String token = bearerToken.trim();
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) { 
            token = token.substring(7).trim();
        }
        return token.isEmpty() ? null : token;
    }

    public static boolean isTokenValid(String authorizationHeader, String hmacSecret) {
        try {
            String token = extractToken(authorizationHeader);
            if (token == null) return false;
    
            byte[] keyBytes;
            keyBytes = hmacSecret.trim().getBytes(StandardCharsets.UTF_8);
    
            if (keyBytes.length < 32) {
                return false;
            }
    
            SignedJWT jwt = SignedJWT.parse(token);
    
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm())) {
                return false;
            }
    
            JWSVerifier verifier = new MACVerifier(keyBytes);
            boolean sigOk = jwt.verify(verifier);
            if (!sigOk) return false;
    
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            Date now = new Date();
            Date exp = claims.getExpirationTime();
            Date nbf = claims.getNotBeforeTime();
    
            if (exp == null || now.after(exp)) return false;
            if (nbf != null && now.before(nbf)) return false;
    
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}