package capstone.api.user;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;
import capstone.api.domain.user.*;

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
}