package capstone.api.controller.mapper;

import capstone.api.contract.UserContract;
import capstone.api.dto.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserDtoMapper {
    UserContract.RegisterCommand toCommand(UserDto.RegisterRequest request);
    UserContract.LoginCommand toCommand(UserDto.LoginRequest request);

    UserDto.LoginResponse from(UserContract.LoginResult result);
    UserDto.UserResponse from(UserContract.UserResult result);
}
