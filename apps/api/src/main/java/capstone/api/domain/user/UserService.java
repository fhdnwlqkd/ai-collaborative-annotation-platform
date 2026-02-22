package capstone.api.domain.user;

import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
    @Transactional
    public void updateUserName(Long id, String newName){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + id));
        user.changeName(newName);
    }
}

