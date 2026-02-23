//로그인용
package capstone.api.domain.user.dto;

public record LoginRequest (
        String email,
        String password
){}
