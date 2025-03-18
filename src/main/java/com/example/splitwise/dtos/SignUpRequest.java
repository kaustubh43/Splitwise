package com.example.splitwise.dtos;

import lombok.Getter;

@Getter
public class SignUpRequest {
    String email, password, name;
    Long phoneNumber;
}
