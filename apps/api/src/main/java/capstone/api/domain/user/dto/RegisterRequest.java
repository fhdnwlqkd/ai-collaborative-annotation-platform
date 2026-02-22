package capstone.api.domain.user.dto;

public record RegisterRequest(
        String email,
        String password,
        String name
){}
