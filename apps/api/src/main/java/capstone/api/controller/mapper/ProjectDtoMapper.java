package capstone.api.controller.mapper;

import capstone.api.contract.ProjectContract;
import capstone.api.dto.ProjectDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProjectDtoMapper {
    ProjectContract.CreateCommand toCommand(ProjectDto.CreateRequest request);
    ProjectContract.JoinCommand toCommand(ProjectDto.JoinRequest request);

    ProjectDto.ProjectResponse from(ProjectContract.ProjectResult result);

    java.util.List<ProjectDto.ProjectListReadModel> from(java.util.List<ProjectContract.ProjectListResult> results);
}
