package capstone.api.repository;

import capstone.api.domain.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
}
