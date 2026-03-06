package capstone.api.core.auth;

import capstone.api.domain.User;
import capstone.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String externalId) throws UsernameNotFoundException {
        User user = userRepository.findByExternalId(externalId)
                .orElseThrow(() -> new UsernameNotFoundException("user '" + externalId + "' not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getExternalId(),
                "", // 비밀번호는 이미 JWT 검증 단계에서 끝났으므로 비워둡니다.
                Collections.emptyList() // 권한 설정이 필요하다면 여기에 추가
        );
    }
}
