package com.example.splitwise.strategies;

import com.example.splitwise.models.UserExpense;

import java.util.List;

public interface SettleUpStrategy {
    List<Transaction> settleUp(List<UserExpense> expenses);
}
