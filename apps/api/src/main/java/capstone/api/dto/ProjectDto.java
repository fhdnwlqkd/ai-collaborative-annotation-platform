package capstone.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ProjectDto {

    @Schema(description = "프로젝트 생성 요청")
    public record CreateRequest(
            @Schema(description = "프로젝트 이름", example = "AI 이미지 레이블링 프로젝트")
            @NotBlank @Size(min = 1, max = 100)
            String name,

            @Schema(description = "프로젝트 상세 설명", example = "자율주행 학습용 데이터 가공을 위한 프로젝트입니다.")
            String description
    ) {}

    @Schema(description = "프로젝트 참여 요청")
    public record JoinRequest(
            @Schema(description = "초대 코드 (10자리)", example = "a1b2c3d4e5")
            @NotBlank
            String inviteCode
    ) {}

    @Schema(description = "프로젝트 응답")
    public record ProjectResponse(
            @Schema(description = "내부 식별자", example = "1")
            Long id,

            @Schema(description = "프로젝트 이름", example = "AI 이미지 레이블링 프로젝트")
            String name,

            @Schema(description = "프로젝트 상세 설명", example = "자율주행 학습용 데이터 가공을 위한 프로젝트입니다.")
            String description,

            @Schema(description = "초대 코드", example = "a1b2c3d4e5")
            String inviteCode,

            @Schema(description = "생성 일시", example = "2026-03-02T14:00:00")
            LocalDateTime createdAt
    ) {}
}
