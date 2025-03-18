package com.example.splitwise.services;

import com.example.splitwise.exceptions.UserAlreadyExists;
import com.example.splitwise.exceptions.UserNotExist;
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

    public User signUp(String email, String password, String name, Long phoneNumber) throws UserAlreadyExists {
        // Check if user exists
        Optional<User> checkUser = userRepository.findByEmail(email);
        if(checkUser.isPresent()) {
            throw new UserAlreadyExists();
        }
        User user = User.builder()
                .email(email)
                .password(password)
                .name(name)
                .phoneNumber(phoneNumber)
                .build();

        return userRepository.save(user);
    }

    public boolean signIn(String email, String password) throws UserNotExist {
        // Check if user exists
        Optional<User> checkUser = userRepository.findByEmail(email);
        if(checkUser.isEmpty()) {
            throw new UserNotExist();
        }
        return password.equals(checkUser.get().getPassword());
    }
}
