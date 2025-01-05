package ua.leader171.finance.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppUserResponseDTO {

    private String username;
    private String email;
}
