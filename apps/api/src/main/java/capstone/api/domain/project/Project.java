package capstone.api.domain.project;

import capstone.api.domain.user.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User owner;

    @Column(name = "invite_code", nullable = false, unique = true, length = 32)
    private String inviteCode;

    /* 나중에 model_version 추가
    @Column(name = "active_model_version_id")
    private Long activeModelVersionId;
    */

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Project() {}

    public Project(String name, String description, User owner) {
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getInviteCode() { return inviteCode; }
    public Instant getCreatedAt() { return createdAt; }
    public String getDescription() { return description; }
    public User getOwner() { return owner; }

    public void rename(String name) { this.name = name; }
    public void updateDescription(String description) { this.description = description; }
}