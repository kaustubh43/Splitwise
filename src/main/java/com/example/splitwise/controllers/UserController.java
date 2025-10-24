package com.example.splitwise.controllers;

import com.example.splitwise.dtos.SignInRequest;
import com.example.splitwise.dtos.SignUpRequest;
import com.example.splitwise.dtos.SignUpResponse;
import com.example.splitwise.exceptions.UserAlreadyExists;
import com.example.splitwise.exceptions.UserNotExist;
import com.example.splitwise.models.User;
import com.example.splitwise.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public @ResponseBody SignUpResponse signUp(@RequestBody SignUpRequest user) throws UserAlreadyExists {
        User newUser = userService.signUp(user.getEmail(), user.getPassword(), user.getName(), user.getPhoneNumber());
        return SignUpResponse.builder()
                .id(newUser.getId())
                .email(newUser.getEmail())
                .build();
    }

    @PostMapping("/signin")
    @ResponseStatus(HttpStatus.OK)
    public boolean signIn(@RequestBody SignInRequest user) throws UserNotExist {
        return userService.signIn(user.getEmail(), user.getPassword());
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody List<User> getAllUsers(){
        return userService.getAllUsers();
    }
}
