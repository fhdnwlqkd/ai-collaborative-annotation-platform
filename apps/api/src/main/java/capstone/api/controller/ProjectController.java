package capstone.api.controller;


import capstone.api.contract.ProjectContract;
import capstone.api.controller.mapper.ProjectDtoMapper;
import capstone.api.core.api.ApiResponse;
import capstone.api.dto.ProjectDto;
import capstone.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Project", description = "프로젝트 관련 API")
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectDtoMapper projectDtoMapper;

    @Operation(summary = "참여 중인 프로젝트 목록 조회", description = "현재 로그인한 사용자가 참여 중인 프로젝트 목록을 조회합니다. 멤버 수와 태스크 수가 포함됩니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto.ProjectListReadModel>>> getProjectList(
            @AuthenticationPrincipal UserDetails userDetails) {
        String externalId = userDetails.getUsername();
        List<ProjectContract.ProjectListResult> results = projectService.getProjectList(externalId);
        return ResponseEntity.ok(ApiResponse.success(projectDtoMapper.from(results)));
    }

    @Operation(summary = "프로젝트 생성", description = "새로운 프로젝트를 생성합니다. 생성자는 자동으로 OWNER 권한을 갖습니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto.ProjectResponse>> createProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProjectDto.CreateRequest request) {
        String externalId = userDetails.getUsername();

        ProjectContract.ProjectResult result = projectService.createProject(
                externalId,
                projectDtoMapper.toCommand(request)
        );

        return ResponseEntity.ok(ApiResponse.success(projectDtoMapper.from(result)));
    }

    @Operation(summary = "프로젝트 참여", description = "초대 코드를 통해 프로젝트에 참여합니다.")
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<String>> joinProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProjectDto.JoinRequest request){
        String externalId = userDetails.getUsername();
        projectService.joinProject(externalId, projectDtoMapper.toCommand(request));
        return ResponseEntity.ok(ApiResponse.success("프로젝트 참여에 성공했습니다."));
    }
}

