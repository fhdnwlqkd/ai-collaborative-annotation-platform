package capstone.api.project;

import capstone.api.contract.ProjectContract;
import capstone.api.contract.UserContract;
import capstone.api.core.exception.BusinessException;
import capstone.api.core.exception.ErrorCode;
import capstone.api.domain.Project;
import capstone.api.domain.User;
import capstone.api.repository.ProjectMemberRepository;
import capstone.api.repository.ProjectRepository;
import capstone.api.repository.UserRepository;
import capstone.api.service.ProjectService;
import capstone.api.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
@ActiveProfiles("local")
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedUser1;
    private User savedUser2;

    @BeforeEach
    void setUp() {
        // 테스트용 유저 세팅
        userService.registerLocalUser(new UserContract.RegisterCommand("user1@test.com", "password", "유저1"));
        userService.registerLocalUser(new UserContract.RegisterCommand("user2@test.com", "password", "유저2"));

        savedUser1 = userRepository.findByEmail("user1@test.com").orElseThrow();
        savedUser2 = userRepository.findByEmail("user2@test.com").orElseThrow();
    }

    @Test
    @DisplayName("프로젝트 생성 성공: 프로젝트를 생성하면 멤버로 등록되고, OWNER 권한을 갖는다.")
    void createProjectTest() {
        // Given
        String externalId = savedUser1.getExternalId();
        var command = new ProjectContract.CreateCommand("테스트 프로젝트", "예시 프로젝트입니다");

        // When
        ProjectContract.ProjectResult result = projectService.createProject(externalId, command);

        // Then
        assertThat(result.name()).isEqualTo("테스트 프로젝트");
        assertThat(result.description()).isEqualTo("예시 프로젝트입니다");
        assertThat(result.inviteCode()).isNotNull();

        // 생성자가 멤버로 잘 들어갔는지 검증
        Project project = projectRepository.findById(result.id()).orElseThrow();
        boolean isMember = projectMemberRepository.existsByUserIdAndProjectId(savedUser1.getId(), project.getId());
        assertThat(isMember).isTrue();
    }

    @Test
    @DisplayName("프로젝트 참여 성공: 유효한 초대 코드로 참여하면 멤버로 등록된다.")
    void joinProjectTest() {
        // Given: 유저1이 프로젝트를 생성
        ProjectContract.ProjectResult createdProject = projectService.createProject(
                savedUser1.getExternalId(),
                new ProjectContract.CreateCommand("초대받을 프로젝트", "...")
        );

        // When: 유저2가 유저1의 프로젝트 초대 코드로 참여 시도
        var joinCommand = new ProjectContract.JoinCommand(createdProject.inviteCode());
        projectService.joinProject(savedUser2.getExternalId(), joinCommand);

        // Then: 유저2가 해당 프로젝트의 멤버로 등록되어야 함
        boolean isMember = projectMemberRepository.existsByUserIdAndProjectId(savedUser2.getId(), createdProject.id());
        assertThat(isMember).isTrue();
    }

    @Test
    @DisplayName("프로젝트 참여 실패: 잘못된 초대 코드면 예외가 발생한다.")
    void joinProjectFailWithInvalidCode() {
        // Given
        var joinCommand = new ProjectContract.JoinCommand("WRONG_CODE");

        // When & Then
        BusinessException ex = assertThrows(BusinessException.class, () -> {
            projectService.joinProject(savedUser2.getExternalId(), joinCommand);
        });
        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_INVITE_CODE);
    }

    @Test
    @DisplayName("프로젝트 참여 실패: 이미 참여 중인 프로젝트면 예외가 발생한다.")
    void joinProjectFailWhenAlreadyMember() {
        // Given: 유저1이 생성
        ProjectContract.ProjectResult createdProject = projectService.createProject(
                savedUser1.getExternalId(),
                new ProjectContract.CreateCommand("중복참여 테스트", "...")
        );

        // When & Then: 생성자인 유저1이 또 참여하려고 하면 에러 발생
        var joinCommand = new ProjectContract.JoinCommand(createdProject.inviteCode());
        BusinessException ex = assertThrows(BusinessException.class, () -> {
            projectService.joinProject(savedUser1.getExternalId(), joinCommand);
        });
        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALREADY_PROJECT_MEMBER);
    }

    @Test
    @DisplayName("참여 중인 프로젝트 목록 조회")
    void getProjectListTest() {
        // Given: 유저1은 2개의 프로젝트를 생성, 유저2는 1개의 프로젝트를 생성
        projectService.createProject(savedUser1.getExternalId(), new ProjectContract.CreateCommand("프로젝트A", ""));
        projectService.createProject(savedUser1.getExternalId(), new ProjectContract.CreateCommand("프로젝트B", ""));
        projectService.createProject(savedUser2.getExternalId(), new ProjectContract.CreateCommand("프로젝트C", ""));

        // When
        List<ProjectContract.ProjectListResult> user1Projects = projectService.getProjectList(savedUser1.getExternalId());
        List<ProjectContract.ProjectListResult> user2Projects = projectService.getProjectList(savedUser2.getExternalId());

        // Then
        assertThat(user1Projects).hasSize(2);
        assertThat(user2Projects).hasSize(1);
    }
}
