package capstone.api.core.api;

import capstone.api.core.exception.ErrorCode;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Swagger UI에서 여러 개의 에러 코드를 예시(Example)로 보여주기 위한 어노테이션입니다.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiErrorCodeExample {
    ErrorCode[] value();
}
