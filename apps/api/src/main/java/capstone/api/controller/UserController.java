package capstone.api.controller;

import capstone.api.domain.User;
import capstone.api.service.UserService;
import capstone.api.dto.LoginRequest;
import capstone.api.dto.LoginResponse;
import capstone.api.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerLocal(@RequestBody RegisterRequest request){
        try{
            User newUser = userService.registerLocalUser(
                    request.email(),
                    request.password(),
                    request.name()
            );
            return ResponseEntity.ok("회원가입 성공. 생성된 유저 ID : " + newUser.getId());
        } catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = userService.login(request.email(), request.password());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
