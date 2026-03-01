package capstone.api.core.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "에러 응답 규격 (BusinessException 발생 시 반환)")
public record ExceptionResponse(
        @Schema(description = "에러 식별 코드", example = "U001")
        String code,

        @Schema(description = "에러 명칭", example = "USER_NOT_FOUND")
        String errorName,

        @Schema(description = "사용자용 에러 메시지", example = "존재하지 않는 회원입니다.")
        String message,

        @Schema(description = "유효성 검사 실패 시 상세 항목 목록 (없을 경우 빈 리스트)")
        List<FieldError> errors
) {
    @Schema(description = "필드 단위 유효성 검사 오류 상세")
    public record FieldError(
            @Schema(description = "오류가 발생한 필드명", example = "loginId")
            String field,

            @Schema(description = "클라이언트가 보낸 잘못된 값", example = " ")
            String value,

            @Schema(description = "필드 에러 사유", example = "아이디는 필수 입력값입니다.")
            String reason
    ) {}
}
