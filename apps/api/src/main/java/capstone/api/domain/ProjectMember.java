package capstone.api.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "project_members")
@IdClass(ProjectMemberId.class) // 복합 키 클래스
public class ProjectMember {

    public enum Role { OWNER, PARTICIPANT }

    @Id // PK의 일부
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Id // PK의 일부
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt = Instant.now();

    protected ProjectMember() {}

    public ProjectMember(Project project, User user, Role role) {
        this.project = project;
        this.user = user;
        this.role = role;
        this.joinedAt = Instant.now();
    }

    // Getter들
    public Project getProject() { return project; }
    public User getUser() { return user; }
    public Role getRole() { return role; }
    public Instant getJoinedAt() { return joinedAt; }
}