package capstone.api.core.exception;

import capstone.api.core.api.ApiResponse;
import capstone.api.core.api.ExceptionResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;

@RestControllerAdvice
@Slf4j
@NullMarked
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * 비즈니스 로직 예외 처리 (커스텀 ErrorCode 기반)
     */
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("Business Exception: {} - {}", errorCode.name(), errorCode.getMessage());

        ExceptionResponse response = new ExceptionResponse(
                errorCode.getCode(),
                errorCode.name(),
                errorCode.getMessage(),
                List.of()
        );

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.fail(response));
    }

    /**
     * DTO 유효성 검사(@Valid) 실패 시 처리
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        log.warn("Validation Exception: {}", ex.getBindingResult().getFieldError().getDefaultMessage());

        // FieldError 리스트 생성
        List<ExceptionResponse.FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> {
                    error.getRejectedValue();
                    return new ExceptionResponse.FieldError(
                            error.getField(),
                            error.getRejectedValue().toString(),
                            error.getDefaultMessage());
                })
                .toList();

        ExceptionResponse response = new ExceptionResponse(
                ErrorCode.INVALID_INPUT.getCode(),
                ErrorCode.INVALID_INPUT.name(),
                "입력값이 유효하지 않습니다.",
                errors
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(response));
    }

    /**
     * 알 수 없는 예외 처리
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("Unhandled Exception: ", e);

        ExceptionResponse response = new ExceptionResponse(
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                ErrorCode.INTERNAL_SERVER_ERROR.name(),
                e.getMessage(),
                List.of()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail(response));
    }
}