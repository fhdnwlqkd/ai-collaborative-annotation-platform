package capstone.api.controller;


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

    @PostMapping
    public ProjectResponse createProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateProjectRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());

        return projectService.createProject(userId, request);
    }
    @PostMapping("/join")
    public ResponseEntity<String> joinProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinProjectRequest request){
        Long userId = Long.parseLong(userDetails.getUsername());
        projectService.joinProject(userId, request);
        return ResponseEntity.ok("프로젝트 참여에 성공했습니다.");
    }
}
