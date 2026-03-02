package capstone.api.service.mapper;

import capstone.api.contract.ProjectContract;
import capstone.api.domain.Project;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProjectMapper {
    ProjectContract.ProjectResult toResult(Project project);
}
