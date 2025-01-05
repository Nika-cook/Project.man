package ua.leader171.finance.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public AppUser createUser(AppUserDTO appUser) {
        if (getUserByUsername(appUser.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Користувач із таким ім'ям уже існує");
        }
        AppUser user = new AppUser();
        user.setPassword(passwordEncoder.encode(appUser.getPassword()));
        user.setRole("USER");
        user.setUsername(appUser.getUsername());
        user.setEmail(appUser.getEmail());
        return userRepository.save(user);
    }

    public Optional<AppUser> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<AppUserResponseDTO> getUserDTOByUsername(String username) {
        Optional<AppUser> byUsername = userRepository.findByUsername(username);
        if (byUsername.isEmpty()){
            return Optional.empty();
        }
        var userDTO = new AppUserResponseDTO();
        userDTO.setUsername(byUsername.get().getUsername());
        userDTO.setEmail(byUsername.get().getEmail());
        return Optional.of(userDTO);
    }
}
