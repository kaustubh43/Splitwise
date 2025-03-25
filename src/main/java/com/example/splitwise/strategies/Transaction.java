package com.example.splitwise.strategies;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.example.splitwise.models.User;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {
    double amount;
    User paidBy;
    User paidTo;
}
