package capstone.api.user;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;
import capstone.api.domain.user.*;
import static org.mockito.BDDMockito.given;

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

        // When
        User savedUser = userService.registerLocalUser(email, password, name);

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo(email);
        assertThat(savedUser.getName()).isEqualTo(name);

        System.out.println("테스트 성공! 저장된 유저 ID: " + savedUser.getId());
    }

    @Test
    @DisplayName("유저 이름 수정")
    void updateNameTest(){
        User user = userService.registerLocalUser("update@test.com", "password", "구이름");
        Long userId = user.getId();

        userService.updateUserName(userId, "새이름");

        User updatedUser = userRepository.findById(userId).orElseThrow();
        assertThat(updatedUser.getName()).isEqualTo("새이름");

        System.out.println("이름 수정 성공. 변경된 이름: " + updatedUser.getName());
    }

    @Test
    @DisplayName("중복 이메일 가입")
    void duplicateEmailTest(){
        String email = "duplicate@test.com";
        userService.registerLocalUser(email, "password", "유저1");

        Assertions.assertThrows(RuntimeException.class, () -> {
            userService.registerLocalUser(email, "password123", "유저2");
        });
        System.out.println("중복 가입 에러 정상 발생");
    }
    @Test
    @DisplayName("로그인 성공: 가입한 정보로 로그인하면 토큰이 발급된다")
    void loginSuccessTest() {
        // Given: 회원가입 먼저 진행
        String email = "login_success@test.com";
        String password = "password123";
        userService.registerLocalUser(email, password, "로그인테스터");

        // When: 로그인 시도
        String token = userService.login(email, password);

        // Then: 토큰이 비어있지 않고 JWT 형식을 갖췄는지 확인
        assertThat(token).isNotNull();
        assertThat(token).startsWith("eyJ"); // JWT의 Header는 항상 eyJ로 시작합니다.
        System.out.println("로그인 성공! 발급된 토큰: " + token);
    }

    @Test
    @DisplayName("로그인 실패: 잘못된 비밀번호로 로그인하면 에러가 발생한다")
    void loginFailWithWrongPassword() {
        // Given
        String email = "login_fail@test.com";
        userService.registerLocalUser(email, "correct_password", "실패테스터");

        // When & Then
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            userService.login(email, "wrong_password");
        });
        System.out.println("로그인 실패 테스트 완료: 비밀번호 불일치 에러 확인");
    }
}