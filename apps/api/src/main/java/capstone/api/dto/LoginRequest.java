//로그인용
package capstone.api.dto;

public record LoginRequest (
        String email,
        String password
){}
