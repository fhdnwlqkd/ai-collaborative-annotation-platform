package capstone.api.service;


import capstone.api.domain.Project;
import capstone.api.domain.ProjectMember;
import capstone.api.dto.JoinProjectRequest;
import capstone.api.repository.ProjectRepository;
import capstone.api.dto.CreateProjectRequest;
import capstone.api.dto.ProjectResponse;
import capstone.api.domain.User;
import capstone.api.repository.ProjectMemberRepository;
import capstone.api.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(Long userId, CreateProjectRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. ID: " + userId));

        Project project = new Project(request.name(), request.description(), owner);
        Project savedProject = projectRepository.save(project);

        ProjectMember member = new ProjectMember(savedProject, owner, ProjectMember.Role.OWNER);
        projectMemberRepository.save(member);

        return ProjectResponse.from(savedProject);
    }
    @Transactional
    public void joinProject(Long userId, JoinProjectRequest request){
        Project project = projectRepository.findByInviteCode(request.inviteCode())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않거나 존재하지 않는 초대 코드입니다."));
        //이미 참여중인 유저인지 확인(중복방지)
        if(projectMemberRepository.existsByUserIdAndProjectId(userId, project.getId())){
            throw new IllegalArgumentException("이미 참여 중인 프로젝트입니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        ProjectMember newMember = new ProjectMember(project, user, ProjectMember.Role.PARTICIPANT);
        projectMemberRepository.save(newMember);

    }
}
