package capstone.api.user;

import capstone.api.contract.UserContract;
import capstone.api.core.exception.BusinessException;
import capstone.api.core.exception.ErrorCode;
import capstone.api.domain.User;
import capstone.api.repository.UserRepository;
import capstone.api.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("local")
class UserServiceTest {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("회원가입")
    void registerUserTest() {
        // Given
        String email = "test_user@naver.com";
        String password = "password123";
        String name = "테스터";
        var command = new UserContract.RegisterCommand(email, password, name);

        // When
        var result = userService.registerLocalUser(command);

        // Then
        // result 검증
        assertThat(result.email()).isEqualTo(email);
        assertThat(result.name()).isEqualTo(name);

        // DB에 저장된 유저 검증
        User user = userRepository.findByEmail(email).orElseThrow();
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getName()).isEqualTo(name);
    }

//    @Test
//    @DisplayName("유저 이름 수정")
//    void updateNameTest(){
//        User user = userService.registerLocalUser("update@test.com", "password", "구이름");
//        Long userId = user.getId();
//
//        userService.updateUserName(userId, "새이름");
//
//        User updatedUser = userRepository.findById(userId).orElseThrow();
//        assertThat(updatedUser.getName()).isEqualTo("새이름");
//
//        System.out.println("이름 수정 성공. 변경된 이름: " + updatedUser.getName());
//    }

    @Test
    @DisplayName("중복 이메일 가입")
    void duplicateEmailTest(){
        String email = "duplicate@test.com";
        var command = new UserContract.RegisterCommand(email, "password", "유저1");
        userService.registerLocalUser(command);

        BusinessException ex = Assertions.assertThrows(BusinessException.class, () -> {
            userService.registerLocalUser(command);
        });
        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS);
    }
    @Test
    @DisplayName("로그인 성공: 가입한 정보로 로그인하면 토큰이 발급된다")
    void loginSuccessTest() {
        // Given: 회원가입 먼저 진행
        String email = "login_success@test.com";
        String password = "password123";
        var registerCommand = new UserContract.RegisterCommand(email, password, "로그인테스터");
        userService.registerLocalUser(registerCommand);

        var loginCommand = new UserContract.LoginCommand(email, password);
        // When: 로그인 시도
        var result = userService.login(loginCommand);

        // Then: 토큰이 비어있지 않고 JWT 형식을 갖췄는지 확인
        assertThat(result.token()).isNotEmpty();
        // JWT는 일반적으로 세 부분으로 구성된 문자열입니다: header.payload.signature
        String[] tokenParts = result.token().split("\\.");
        assertThat(tokenParts).hasSize(3);
    }

    @Test
    @DisplayName("로그인 실패: 잘못된 비밀번호로 로그인하면 에러가 발생한다")
    void loginFailWithWrongPassword() {
        // Given
        String email = "login_fail@test.com";
        var command = new UserContract.RegisterCommand(email, "correct_password", "실패테스터");
        userService.registerLocalUser(command);

        // When & Then
        BusinessException ex = Assertions.assertThrows(BusinessException.class, () -> {
            userService.login(new UserContract.LoginCommand(email, "wrong_password"));
        });
        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_PASSWORD);
    }
}