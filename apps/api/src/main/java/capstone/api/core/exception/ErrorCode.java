package capstone.api.core.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Common Errors
    INVALID_INPUT("C001", "잘못된 입력값입니다.", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR("C002", "서버 내부 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // user
    USER_NOT_FOUND("U001", "존재하지 않는 사용자입니다.", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("U002", "이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT),
    INVALID_PASSWORD("U003", "비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED),

    // project
    PROJECT_NOT_FOUND("P001", "존재하지 않는 프로젝트입니다.", HttpStatus.NOT_FOUND),
    INVALID_INVITE_CODE("P002", "유효하지 않은 초대 코드입니다.", HttpStatus.BAD_REQUEST),
    ALREADY_PROJECT_MEMBER("P003", "이미 참여 중인 프로젝트입니다.", HttpStatus.CONFLICT),

    // Auth / Security
    UNAUTHORIZED("A001", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("A002", "접근 권한이 없습니다.", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
