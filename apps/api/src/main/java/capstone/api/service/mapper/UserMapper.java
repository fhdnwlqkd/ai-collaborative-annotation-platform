package capstone.api.service.mapper;

import capstone.api.contract.UserContract;
import capstone.api.domain.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    UserContract.UserResult toResult(User user);

    UserContract.LoginResult toResult(String token);
}
