package capstone.api.contract;

import java.time.LocalDateTime;

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
}
