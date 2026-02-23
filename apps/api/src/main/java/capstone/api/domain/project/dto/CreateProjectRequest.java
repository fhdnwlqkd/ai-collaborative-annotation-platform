package capstone.api.domain.project.dto;

public record CreateProjectRequest(
        String name,
        String description
) {}
