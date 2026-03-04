package capstone.api.domain.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProjectMemberRole {
    OWNER,
    PARTICIPANT;
}
