package com.example.splitwise.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupResponse {
    String name;
    Long groupId;
}
