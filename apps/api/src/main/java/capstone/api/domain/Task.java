package capstone.api.domain;

import capstone.api.domain.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@SuperBuilder
@NoArgsConstructor
@Table(name = "tasks", indexes = {
        @Index(name = "idx_project_status", columnList = "project_id, status")
})
public class Task extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /*
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset; // Asset 엔티티 미작성으로 인한 주석 처리
    */

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_user_id")
    private User assignee;

    public static Task create(Project project, User assignee) {
        return Task.builder()
                .project(project)
                .assignee(assignee)
                .status(TaskStatus.TODO)
                .build();
    }

    public void updateStatus(TaskStatus status) {
        this.status = status;
    }

    public void assignTo(User user) {
        this.assignee = user;
    }
}
