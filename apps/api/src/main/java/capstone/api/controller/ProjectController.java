package capstone.api.controller;


import capstone.api.contract.ProjectContract;
import capstone.api.controller.mapper.ProjectDtoMapper;
import capstone.api.core.api.ApiResponse;
import capstone.api.dto.JoinProjectRequest;
import capstone.api.service.ProjectService;
import capstone.api.dto.CreateProjectRequest;
import capstone.api.dto.ProjectResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectDtoMapper projectDtoMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateProjectRequest request) {
        String externalId = userDetails.getUsername();

        ProjectContract.ProjectResult result = projectService.createProject(
                externalId,
                projectDtoMapper.toCommand(request)
        );

        return ResponseEntity.ok(ApiResponse.success(projectDtoMapper.from(result)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<String>> joinProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinProjectRequest request){
        String externalId = userDetails.getUsername();
        projectService.joinProject(externalId, projectDtoMapper.toCommand(request));
        return ResponseEntity.ok(ApiResponse.success("프로젝트 참여에 성공했습니다."));
    }
}
