package capstone.api.project;

import capstone.api.dto.ProjectDto;
import capstone.api.dto.UserDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("local")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String user1Token;
    private String user2Token;

    @BeforeEach
    void setUp() throws Exception {
        // 유저 1 세팅 및 로그인
        registerAndLogin("user1@test.com", "pass123", "유저1");
        user1Token = getToken("user1@test.com", "pass123");

        // 유저 2 세팅 및 로그인
        registerAndLogin("user2@test.com", "pass123", "유저2");
        user2Token = getToken("user2@test.com", "pass123");
    }

    private void registerAndLogin(String email, String password, String name) throws Exception {
        var registerRequest = new UserDto.RegisterRequest(email, password, name);
        mockMvc.perform(post("/api/v1/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));
    }

    private String getToken(String email, String password) throws Exception {
        var loginRequest = new UserDto.LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode rootNode = objectMapper.readTree(responseBody);
        return rootNode.path("data").path("token").asText();
    }

    @Test
    @DisplayName("API 통합 테스트: 프로젝트를 생성한다")
    void createProjectApiTest() throws Exception {
        var request = new ProjectDto.CreateRequest("API 테스트 프로젝트", "테스트입니다");

        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("API 테스트 프로젝트"))
                .andExpect(jsonPath("$.data.inviteCode").exists());
    }

    @Test
    @DisplayName("API 통합 테스트: 유효하지 않은 토큰으로 프로젝트 생성 시 인증 오류가 발생한다")
    void TokenErrorTest() throws Exception {
        var request = new ProjectDto.CreateRequest("API 테스트 프로젝트", "테스트입니다");

        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + "invalid_token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("A001"))
                .andExpect(jsonPath("$.error.message").value("인증이 필요합니다."));
    }

    @Test
    @DisplayName("API 통합 테스트: 프로젝트 목록을 조회한다")
    void getProjectListApiTest() throws Exception {
        // Given: 유저 1이 프로젝트 생성
        var request = new ProjectDto.CreateRequest("리스트 테스트 프로젝트", "");
        mockMvc.perform(post("/api/v1/projects")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // When & Then: 유저 1이 자신의 프로젝트 목록 조회
        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("리스트 테스트 프로젝트"))
                .andExpect(jsonPath("$.data[0].myRole").value("OWNER"));
    }

    @Test
    @DisplayName("API 통합 테스트: 초대 코드로 프로젝트에 참여한다")
    void joinProjectApiTest() throws Exception {
        // Given: 유저 1이 프로젝트 생성 후 초대 코드 추출
        var createRequest = new ProjectDto.CreateRequest("초대 테스트", "");
        MvcResult createResult = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        String inviteCode = objectMapper.readTree(responseBody).path("data").path("inviteCode").asText();

        // When & Then: 유저 2가 해당 코드로 참여 요청
        var joinRequest = new ProjectDto.JoinRequest(inviteCode);
        mockMvc.perform(post("/api/v1/projects/join")
                        .header("Authorization", "Bearer " + user2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(joinRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("프로젝트 참여에 성공했습니다."));
    }
}
