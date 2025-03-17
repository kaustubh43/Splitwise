package com.example.splitwise.dtos;

import lombok.*;


@Builder
@Getter
@Setter
public class SignUpResponse {
    Long id;
    String email;
}
