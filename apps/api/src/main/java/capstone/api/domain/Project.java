package capstone.api.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Getter
@SuperBuilder
@NoArgsConstructor
@Table(name = "projects")
public class Project extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User owner;

    @Column(name = "invite_code", nullable = false, unique = true, length = 32)
    @Builder.Default
    private String inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

    /* 나중에 model_version 추가
    @Column(name = "active_model_version_id")
    private Long activeModelVersionId;
    */

    public static Project create(String name, String description, User owner) {
        return Project.builder()
                .name(name)
                .description(description)
                .owner(owner)
                .build();
    }

    public void rename(String name) { this.name = name; }
    public void updateDescription(String description) { this.description = description; }
}
