package com.example.splitwise.dtos;

import lombok.*;

import java.util.Map;


@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateExpenseResponse {
    Long expenseId;
    String expenseName;
    String groupName;
    Double amount;

    Map<String, Double> paidByMap;
    Map<String, Double> owedByMap;
}
