package capstone.api.contract;

import java.time.LocalDateTime;
import capstone.api.domain.enums.ProjectMemberRole;

public class ProjectContract {
    public record CreateCommand(
            String name,
            String description
    ) {}

    public record JoinCommand(
            String inviteCode
    ) {}

    public record ProjectResult(
            Long id,
            String name,
            String description,
            String inviteCode,
            LocalDateTime createdAt
    ) {}

    public record ProjectListResult(
            Long projectId,
            String name,
            ProjectMemberRole myRole,
            long memberCount,
            long taskCount
    ) {}
}
