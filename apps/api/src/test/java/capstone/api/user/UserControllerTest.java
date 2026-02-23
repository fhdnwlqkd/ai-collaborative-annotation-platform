package capstone.api.user;

import capstone.api.domain.user.dto.LoginRequest;
import capstone.api.domain.user.dto.RegisterRequest;
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
        RegisterRequest register = new RegisterRequest("api_test@test.com", "pass123", "API지성");

        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        // 2. 로그인 API 호출
        LoginRequest login = new LoginRequest("api_test@test.com", "pass123");

        mockMvc.perform(post("/api/v1/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists()) // 응답 바디에 token이 있는지 확인
                .andExpect(jsonPath("$.token").isString());
    }
}