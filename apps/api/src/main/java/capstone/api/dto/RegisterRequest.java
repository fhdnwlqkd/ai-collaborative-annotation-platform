//회원가입용
package capstone.api.dto;

public record RegisterRequest(
        String email,
        String password,
        String name
){}
