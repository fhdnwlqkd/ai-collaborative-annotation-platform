package capstone.api.domain.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProjectMemberRole {
    OWNER("소유자"),
    PARTICIPANT("참여자");

    private final String description;
}
