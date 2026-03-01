package capstone.api.core.api;

import java.time.LocalDateTime;

public record ApiResponse<T>(
        boolean success,
        T data,
        ExceptionResponse error,
        LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, LocalDateTime.now());
    }

    public static ApiResponse<?> fail(ExceptionResponse error) {
        return new ApiResponse<>(false, null, error, LocalDateTime.now());
    }
}
