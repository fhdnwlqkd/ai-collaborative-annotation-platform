package capstone.api.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthFilter(JwtProvider jwtProvider) { this.jwtProvider = jwtProvider; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // HTTP 헤더에서 토큰을 꺼냄
        String token = resolveToken(request);

        // 토큰이 존재하고, 위조되지 않았는지(유효기간 등) 검사
        if (token != null && jwtProvider.validateToken(token)) {

            // 안에 적혀있는 유저 ID를 꺼냄
            Long userId = jwtProvider.getUserIdFromToken(token);

            // (이거로 컨트롤러에서 @AuthenticationPrincipal 로 유저 ID를 바로 꺼내 쓸 수 있음)
            UserDetails userDetails = User.withUsername(String.valueOf(userId))
                    .password("") // 이미 토큰으로 인증되었으니 비밀번호는 비워둠
                    .authorities(Collections.emptyList())
                    .build();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    // HTTP 헤더에서 "Bearer [토큰]" 형태의 문자열을 찾아 순수 토큰만 잘라내는 유틸 메서드
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " (7글자) 이후의 진짜 토큰만 반환
        }
        return null;
    }
}