package ua.leader171.finance.user;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AppUserResponseDTO> registerUser(@RequestBody  @Valid AppUserDTO appUser) {
        AppUser newAppUser = userService.createUser(appUser);
        AppUserResponseDTO dto = new AppUserResponseDTO();
        dto.setEmail(newAppUser.getEmail());
        dto.setUsername(newAppUser.getUsername());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{username}")
    public ResponseEntity<AppUserResponseDTO> getUser(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        if (!Objects.equals(userDetails.getUsername(), username) && !userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.notFound().build();
        }

        return userService.getUserDTOByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
