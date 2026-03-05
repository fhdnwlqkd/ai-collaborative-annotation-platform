package capstone.api.repository;

import capstone.api.contract.ProjectContract;
import capstone.api.domain.QProject;
import capstone.api.domain.QProjectMember;
import capstone.api.domain.QTask;
import capstone.api.domain.QUser;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ProjectQueryRepository {
    private final JPAQueryFactory queryFactory;

    public List<ProjectContract.ProjectListResult> findAllProjectList(String externalId) {
        QProject project = QProject.project;
        QProjectMember projectMember = QProjectMember.projectMember;
        QProjectMember subProjectMember = new QProjectMember("subPm");
        QTask task = QTask.task;
        QUser user = QUser.user;

        return queryFactory
                .select(Projections.constructor(ProjectContract.ProjectListResult.class,
                        project.id,
                        project.name,
                        projectMember.role,
                        subProjectMember.countDistinct(),
                        task.countDistinct()
                ))
                .from(project)
                .join(projectMember).on(projectMember.project.eq(project))
                .join(projectMember.user, user)
                .leftJoin(subProjectMember).on(subProjectMember.project.eq(project))
                .leftJoin(task).on(task.project.eq(project))
                .where(user.externalId.eq(externalId))
                .groupBy(project.id, project.name, projectMember.role)
                .fetch();
    }
}

