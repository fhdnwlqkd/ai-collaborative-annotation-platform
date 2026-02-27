package capstone.api.service;


import capstone.api.domain.Project;
import capstone.api.domain.ProjectMember;
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
}
