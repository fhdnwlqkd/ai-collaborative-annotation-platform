package capstone.api.core.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey secretKey;
    private final long expirationTime;

    // application.yml에서 비밀키와 만료시간을 가져오기
    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationTime // 기본값 하루(24시간)
    ) {
        // 비밀문자열을 암호화 키 객체로 변환
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    public String generateToken(String externalId, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        var builder = Jwts.builder()
                .subject(externalId)
                .claim("email", email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey);

        return builder.compact();
    }

    public String getExternalIdFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public String getEmailFromToken(String token) {
        return parseClaims(token).get("email").toString();
    }

    // 토큰이 유효한지 검증
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}