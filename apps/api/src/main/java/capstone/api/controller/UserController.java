package capstone.api.controller;

import capstone.api.controller.mapper.UserDtoMapper;
import capstone.api.core.api.ApiErrorCodeExample;
import capstone.api.core.api.ApiResponse;
import capstone.api.core.exception.ErrorCode;
import capstone.api.dto.UserDto;
import capstone.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User API", description = "사용자 관리 및 인증 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/users")
public class UserController {
    private final UserService userService;
    private final UserDtoMapper userMapper;

    @Operation(summary = "회원가입", description = "이메일과 비밀번호로 회원가입을 진행합니다.")
    @ApiErrorCodeExample({ErrorCode.INVALID_INPUT, ErrorCode.EMAIL_ALREADY_EXISTS})
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> registerLocal(@RequestBody UserDto.RegisterRequest request){
        var command = userMapper.toCommand(request);
        var result = userService.registerLocalUser(command);
        return ResponseEntity.ok(ApiResponse.success(userMapper.from(result)));
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.")
    @ApiErrorCodeExample({ErrorCode.USER_NOT_FOUND, ErrorCode.INVALID_PASSWORD})
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.LoginResponse>> login(@RequestBody UserDto.LoginRequest request){
        var command = userMapper.toCommand(request);
        var result = userService.login(command);
        return ResponseEntity.ok(ApiResponse.success(userMapper.from(result)));
    }
}
