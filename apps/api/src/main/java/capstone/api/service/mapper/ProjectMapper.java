package capstone.api.service.mapper;

import capstone.api.domain.Project;
import capstone.api.dto.ProjectResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProjectMapper {
    ProjectResponse toResponse(Project project);
}
