package capstone.api.domain.user;

import capstone.api.domain.user.dto.LoginRequest;
import capstone.api.domain.user.dto.LoginResponse;
import capstone.api.domain.user.dto.RegisterRequest;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

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
