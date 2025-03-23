package com.example.splitwise.exceptions;

public class ExpenseNotExist extends Exception {
    public ExpenseNotExist(String expenseDoesNotExist) {
        super(expenseDoesNotExist);
    }
}
