package com.example.splitwise.dtos;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupResponse {
    String name;
    Long groupId;
    List<String> members;
}
