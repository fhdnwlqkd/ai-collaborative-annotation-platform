package capstone.api.controller.mapper;

import capstone.api.contract.ProjectContract;
import capstone.api.dto.CreateProjectRequest;
import capstone.api.dto.JoinProjectRequest;
import capstone.api.dto.ProjectResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProjectDtoMapper {
    ProjectContract.CreateCommand toCommand(CreateProjectRequest request);
    ProjectContract.JoinCommand toCommand(JoinProjectRequest request);

    ProjectResponse from(ProjectContract.ProjectResult result);
}
