package capstone.api.domain.user;

import capstone.api.auth.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }
    @Transactional
    public User registerLocalUser(String email, String rawPassword, String name){
        if(userRepository.existsByEmail(email)){
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User newUser = new User(email, encodedPassword, name);
        return userRepository.save(newUser);
    }
    @Transactional(readOnly = true)
    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        return jwtProvider.generateToken(user.getId(), user.getEmail());
    }

    @Transactional
    public void updateUserName(Long id, String newName){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + id));
        user.changeName(newName);
    }
}

