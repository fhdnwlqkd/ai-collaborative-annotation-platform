package capstone.api.domain.project.dto;

import capstone.api.domain.project.Project;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        String inviteCode,
        Instant createdAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getInviteCode(),
                project.getCreatedAt()
        );
    }
}
