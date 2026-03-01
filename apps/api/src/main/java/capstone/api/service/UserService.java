package capstone.api.service;

import capstone.api.contract.UserContract;
import capstone.api.core.auth.JwtProvider;
import capstone.api.core.exception.BusinessException;
import capstone.api.core.exception.ErrorCode;
import capstone.api.domain.User;
import capstone.api.repository.UserRepository;
import capstone.api.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final UserMapper userMapper;

    @Transactional
    public UserContract.UserResult registerLocalUser(UserContract.RegisterCommand command){
        if(userRepository.existsByEmail(command.email())){
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        String encodedPassword = passwordEncoder.encode(command.password());
        User newUser = User.create(command.email(), encodedPassword, command.name());

        return userMapper.toResult(userRepository.save(newUser));
    }

    public UserContract.LoginResult login(UserContract.LoginCommand command){
        User user = userRepository.findByEmail(command.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
        return userMapper.toResult(jwtProvider.generateToken(user.getExternalId(), user.getEmail()));
    }

//    @Transactional
//    public void updateUserName(Long id, String newName){
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + id));
//        user.changeName(newName);
//    }
}

