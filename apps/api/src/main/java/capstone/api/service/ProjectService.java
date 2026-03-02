package capstone.api.service;


import capstone.api.contract.ProjectContract;
import capstone.api.core.exception.BusinessException;
import capstone.api.core.exception.ErrorCode;
import capstone.api.domain.Project;
import capstone.api.domain.ProjectMember;
import capstone.api.repository.ProjectRepository;
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
    public ProjectContract.ProjectResult createProject(String externalId, ProjectContract.CreateCommand command) {
        User owner = userRepository.findByExternalId(externalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Project project = new Project(command.name(), command.description(), owner);
        Project savedProject = projectRepository.save(project);

        ProjectMember member = new ProjectMember(savedProject, owner, ProjectMember.Role.OWNER);
        projectMemberRepository.save(member);

        return projectMapper.toResult(savedProject);
    }
    @Transactional
    public void joinProject(String externalId, ProjectContract.JoinCommand command){
        Project project = projectRepository.findByInviteCode(command.inviteCode())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INVITE_CODE));

        User user = userRepository.findByExternalId(externalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        //이미 참여중인 유저인지 확인(중복방지)
        if(projectMemberRepository.existsByUserIdAndProjectId(user.getId(), project.getId())){
            throw new BusinessException(ErrorCode.ALREADY_PROJECT_MEMBER);
        }

        ProjectMember newMember = new ProjectMember(project, user, ProjectMember.Role.PARTICIPANT);
        projectMemberRepository.save(newMember);
    }
}
