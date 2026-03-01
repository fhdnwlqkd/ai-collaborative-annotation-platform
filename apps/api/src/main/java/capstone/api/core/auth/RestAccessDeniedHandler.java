package capstone.api.core.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import capstone.api.core.api.ApiResponse;
import capstone.api.core.api.ExceptionResponse;
import capstone.api.core.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        var error = new ExceptionResponse(
                ErrorCode.FORBIDDEN.getCode(),
                ErrorCode.FORBIDDEN.name(),
                ErrorCode.FORBIDDEN.getMessage(),
                List.of()
        );

        response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), ApiResponse.fail(error));
    }
}