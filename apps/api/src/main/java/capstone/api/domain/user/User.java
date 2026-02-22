package capstone.api.domain.user;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //로그인용
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    //소셜로그인 허용 할거면 nullable = true로 변경하기.
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "name", nullable = false, length = 64)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    //로그인 방식(ex: google, local..) 나중에 필요시 추가 -> ENUM 으로 추가하기
//    @Column(name = "provider", nullable = false, length = 20)
//    private String provider;

    protected User() {}

    public User(String email, String passwordHash, String name){
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        //this.provider = "LOCAL";
        this.createdAt = Instant.now();
    }

    //소셜 로그인용 생성자
//    public User(String email, String name, String provider){
//        this.email = email;
//        this.passwordHash = null;
//        this.name = name;
//        this.provider = provider;
//        this.createdAt = Instant.now();
//    }

    //Getters
    public Long getId() {
        return id;
    }
    public String getEmail() {
        return email;
    }
    public String getPasswordHash() {
        return passwordHash;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public String getName() {
        return name;
    }
    public void changeName(String name) { this.name = name; }
    public void changePasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
