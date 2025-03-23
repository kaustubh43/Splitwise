package com.example.splitwise.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {
    String name;
    Double amount;
    Long groupId;

    Map<Long, Double> paidBy;       // userId: Amount
    Map<Long, Double> owedBy;       // userId: Amount
}
