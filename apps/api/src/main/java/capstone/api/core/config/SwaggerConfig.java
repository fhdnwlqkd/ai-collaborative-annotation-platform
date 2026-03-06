package capstone.api.core.config;

import capstone.api.core.api.ApiErrorCodeExample;
import capstone.api.core.api.ApiResponse;
import capstone.api.core.api.ExceptionResponse;
import capstone.api.core.exception.ErrorCode;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
public class SwaggerConfig {

    @Bean
    public OperationCustomizer customize() {
        return (Operation operation, HandlerMethod handlerMethod) -> {
            ApiErrorCodeExample annotation = handlerMethod.getMethodAnnotation(ApiErrorCodeExample.class);
            if (annotation != null) {
                generateErrorCodeResponseExample(operation, annotation.value());
            }
            return operation;
        };
    }

    private void generateErrorCodeResponseExample(Operation operation, ErrorCode[] errorCodes) {
        ApiResponses responses = operation.getResponses();

        // 에러 코드들을 HTTP Status 별로 그룹화합니다.
        Map<Integer, List<ErrorCode>> errorCodeGroups = Arrays.stream(errorCodes)
                .collect(Collectors.groupingBy(errorCode -> errorCode.getHttpStatus().value()));

        errorCodeGroups.forEach((status, codes) -> {
            String httpStatusStr = String.valueOf(status);
            io.swagger.v3.oas.models.responses.ApiResponse apiResponse = responses.get(httpStatusStr);

            if (apiResponse == null) {
                apiResponse = new io.swagger.v3.oas.models.responses.ApiResponse().description("에러 발생");
                responses.addApiResponse(httpStatusStr, apiResponse);
            }

            Content content = apiResponse.getContent();
            if (content == null) {
                content = new Content();
                apiResponse.setContent(content);
            }

            MediaType mediaType = content.get("application/json");
            if (mediaType == null) {
                mediaType = new MediaType();
                content.addMediaType("application/json", mediaType);
            }

            // 각 에러 코드별 예시 데이터를 추가합니다.
            for (ErrorCode errorCode : codes) {
                Example example = new Example();
                example.setValue(ApiResponse.fail(new ExceptionResponse(
                        errorCode.getCode(),
                        errorCode.name(),
                        errorCode.getMessage(),
                        List.of()
                )));
                example.setSummary(errorCode.name());
                example.setDescription(errorCode.getMessage());
                mediaType.addExamples(errorCode.name(), example);
            }
        });
    }
}
