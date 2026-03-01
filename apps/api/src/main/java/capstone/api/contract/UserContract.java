package capstone.api.contract;

public class UserContract {
    public record LoginCommand(
            String email,
            String password
    ) {}

    public record RegisterCommand(
            String email,
            String password,
            String name
    ) {}

    public record LoginResult(
            String token
    ) {}

    public record UserResult(
            String externalId,
            String email,
            String name,
            String createdAt
    ) {}
}
