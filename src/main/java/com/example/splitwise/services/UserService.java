package com.example.splitwise.services;

import com.example.splitwise.exceptions.UserAlreadyExists;
import com.example.splitwise.models.User;
import com.example.splitwise.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User signUp(String email, String password) throws UserAlreadyExists {
        // Check if user exists
        Optional<User> checkUser = userRepository.findByEmail(email);
        if(checkUser.isPresent()) {
            throw new UserAlreadyExists();
        }
        User user = User.builder()
                .email(email)
                .password(password)
                .build();

        return userRepository.save(user);
    }
}
