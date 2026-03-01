package capstone.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UserDto {
    @Schema(description = "일반 회원가입 요청")
    public record RegisterRequest(
            @Schema(description = "이메일", example = "gildong123@gmail.com")
            @NotBlank @Size(min = 4, max = 20)
            String email,

            @Schema(description = "비밀번호 (8자 이상)", example = "Password123!")
            @NotBlank @Size(min = 8)
            String password,

            @Schema(description = "사용자 실명", example = "홍길동")
            @NotBlank
            String name
    ) {}

    @Schema(description = "로그인 요청")
    public record LoginRequest(
            @Schema(description = "이메일", example = "gildong123@gmail.com")
            @NotBlank String email,

            @Schema(description = "비밀번호", example = "Password123!")
            @NotBlank String password
    ) {}

    @Schema(description = "인증 토큰 응답")
    public record LoginResponse(
            @Schema(description = "Access 토큰 (Bearer 타입, 만료 시간 24시간)",
                    example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            String token
    ) {}

    @Schema(description = "일반 회원 응답")
    public record UserResponse(
            @Schema(description = "외부 노출용 식별자", example = "mem_8f2b3c4d")
            String externalId,

            @Schema(description = "로그인 ID", example = "gildong123")
            String email,

            @Schema(description = "사용자 이름", example = "홍길동")
            String name,

            @Schema(description = "가입 일시", example = "2026-02-01T14:00:00")
            LocalDateTime createdAt
    ) {}

}
