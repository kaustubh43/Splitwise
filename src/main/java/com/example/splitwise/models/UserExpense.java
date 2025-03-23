package com.example.splitwise.models;

import jakarta.annotation.security.DenyAll;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name="user_expense")
public class UserExpense extends BaseModel {
    @ManyToOne
    @JoinColumn(name="expense_id")
    private Expense expense;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    Double amount;

    ExpenseType expenseType;
}
