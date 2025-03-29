package com.example.splitwise.dtos;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SettlementTransaction {
    String paidBy;
    String paidTo;
    Double amount;
}
