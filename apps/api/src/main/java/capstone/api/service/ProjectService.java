package capstone.api.service;


import capstone.api.core.exception.BusinessException;
import capstone.api.core.exception.ErrorCode;
import capstone.api.domain.Project;
import capstone.api.domain.ProjectMember;
import capstone.api.dto.JoinProjectRequest;
import capstone.api.repository.ProjectRepository;
import capstone.api.dto.CreateProjectRequest;
import capstone.api.dto.ProjectResponse;
import capstone.api.domain.User;
import capstone.api.repository.ProjectMemberRepository;
import capstone.api.repository.UserRepository;
import capstone.api.service.mapper.ProjectMapper;
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
    private final ProjectMapper projectMapper;

    @Transactional
    public ProjectResponse createProject(Long userId, CreateProjectRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Project project = new Project(request.name(), request.description(), owner);
        Project savedProject = projectRepository.save(project);

        ProjectMember member = new ProjectMember(savedProject, owner, ProjectMember.Role.OWNER);
        projectMemberRepository.save(member);

        return projectMapper.toResponse(savedProject);
    }
    @Transactional
    public void joinProject(Long userId, JoinProjectRequest request){
        Project project = projectRepository.findByInviteCode(request.inviteCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INVITE_CODE));

        //이미 참여중인 유저인지 확인(중복방지)
        if(projectMemberRepository.existsByUserIdAndProjectId(userId, project.getId())){
            throw new BusinessException(ErrorCode.ALREADY_PROJECT_MEMBER);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ProjectMember newMember = new ProjectMember(project, user, ProjectMember.Role.PARTICIPANT);
        projectMemberRepository.save(newMember);
    }
}
