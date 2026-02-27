package capstone.api.domain;

import java.io.Serializable;
import java.util.Objects;

// 복합 키 클래스는 반드시 Serializable을 구현하고 equals, hashCode를 재정의해야함
public class ProjectMemberId implements Serializable {
    private Long project;
    private Long user;

    public ProjectMemberId() {}

    public ProjectMemberId(Long project, Long user) {
        this.project = project;
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectMemberId that = (ProjectMemberId) o;
        return Objects.equals(project, that.project) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(project, user);
    }
}