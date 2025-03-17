package com.example.splitwise.controllers;

import com.example.splitwise.dtos.SignUpRequest;
import com.example.splitwise.dtos.SignUpResponse;
import com.example.splitwise.exceptions.UserAlreadyExists;
import com.example.splitwise.models.User;
import com.example.splitwise.services.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public @ResponseBody SignUpResponse addUser(@RequestBody SignUpRequest user) throws UserAlreadyExists {
        User newUser = userService.signUp(user.getEmail(), user.getPassword());
        return SignUpResponse.builder()
                .id(newUser.getId())
                .email(newUser.getEmail())
                .build();
    }
}
