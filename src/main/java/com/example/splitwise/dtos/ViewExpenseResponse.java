package com.example.splitwise.dtos;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViewExpenseResponse {
    Long id;
    String name;
    Double amount;
    Map<String, Double> paidBy;
    Map<String, Double> owedBy;
}
