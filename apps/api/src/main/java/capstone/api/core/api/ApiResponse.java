package capstone.api.core.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "공통 응답 규격")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        @Schema(description = "성공 여부")
        boolean success,

        @Schema(description = "응답 데이터 (성공 시)")
        T data,

        @Schema(description = "에러 상세 정보 (실패 시)")
        ExceptionResponse error,

        @Schema(description = "응답 생성 일시")
        LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, LocalDateTime.now());
    }

    public static ApiResponse<?> fail(ExceptionResponse error) {
        return new ApiResponse<>(false, null, error, LocalDateTime.now());
    }
}
