package com.example.splitwise.strategies;

import lombok.Getter;
import lombok.Setter;
import com.example.splitwise.models.User;

@Getter
@Setter
public class Transaction {
    double amount;
    User paidBy;
    User paidTo;
}
