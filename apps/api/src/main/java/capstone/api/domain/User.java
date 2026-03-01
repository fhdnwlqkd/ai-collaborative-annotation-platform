package capstone.api.domain;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Getter
@SuperBuilder
@NoArgsConstructor
@Table(name = "users")
public class User extends BaseEntity {
    @Column(unique = true, nullable = false, updatable = false)
    @Builder.Default
    private String externalId = UUID.randomUUID().toString();

    //로그인용
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    //소셜로그인 허용 할거면 nullable = true로 변경하기.
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "name", nullable = false, length = 64)
    private String name;

    //로그인 방식(ex: google, local..) 나중에 필요시 추가 -> ENUM 으로 추가하기
//    @Column(name = "provider", nullable = false, length = 20)
//    private String provider;

    //소셜 로그인용 생성자
//    public User(String email, String name, String provider){
//        this.email = email;
//        this.passwordHash = null;
//        this.name = name;
//        this.provider = provider;
//        this.createdAt = Instant.now();
//    }

    public void changeName(String name) { this.name = name; }
    public void changePasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public static User create(String loginId, String password, String name) {
        return User.builder()
                .email(loginId)
                .passwordHash(password)
                .name(name)
                .build();
    }
}
