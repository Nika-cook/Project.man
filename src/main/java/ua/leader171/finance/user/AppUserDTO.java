package ua.leader171.finance.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppUserDTO {
    @NotBlank
    private String username;
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
