package capstone.api.repository;

import capstone.api.domain.ProjectMember;
import capstone.api.domain.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
}
