package capstone.api.user;

import capstone.api.dto.UserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc // 컨트롤러 테스트를 위한 가짜 클라이언트 설정
@Transactional
@ActiveProfiles("local")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("API 통합 테스트: 회원가입 후 로그인하여 토큰을 발급받는다")
    void registerAndLoginApiTest() throws Exception {
        // 1. 회원가입 API 호출
        var registerRequest = new UserDto.RegisterRequest("api_test@test.com", "pass123", "API지성");

        var registerResponse = mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());
        System.out.println("회원가입 API 호출 결과: " + registerResponse.andReturn().getResponse().getContentAsString());

        // 2. 로그인 API 호출
        var loginRequest = new UserDto.LoginRequest("api_test@test.com", "pass123");

        mockMvc.perform(post("/api/v1/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").exists()) // 응답 바디에 token이 있는지 확인
                .andExpect(jsonPath("$.data.token").isString());
    }

    @Test
    @DisplayName("API 통합 테스트: 중복 회원가입은 실패한다")
    void duplicateRegisterFails() throws Exception {
        var registerRequest = new UserDto.RegisterRequest("dup_test@test.com", "pass123", "중복테스트");

        // 1) 첫 가입 성공
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // 2) 같은 이메일로 재가입 → 실패
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.error.code").exists());
    }

    @Test
    @DisplayName("API 통합 테스트: 비밀번호 불일치 로그인은 실패한다")
    void loginFailsWithWrongPassword() throws Exception {
        // 1) 가입
        var registerRequest = new UserDto.RegisterRequest("wrong_pw@test.com", "pass123", "비번테스트");

        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // 2) 로그인 실패 (wrong password)
        var loginRequest = new UserDto.LoginRequest("wrong_pw@test.com", "wrong_password");

        mockMvc.perform(post("/api/v1/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.error.code").exists());
    }

    @Test
    @DisplayName("API 통합 테스트: 잘못된 토큰으로 프로젝트 생성 시 401(ApiResponse.fail) 응답")
    void createProjectFailsWithInvalidToken() throws Exception {
        var createProjectRequest = new java.util.HashMap<String, Object>();
        createProjectRequest.put("name", "테스트 프로젝트");
        createProjectRequest.put("description", "invalid token test");

        var s = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + "this.is.not.a.jwt")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createProjectRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.error.code").value("A001"));
        System.out.println(s.andReturn().getResponse().getContentAsString());
    }
}