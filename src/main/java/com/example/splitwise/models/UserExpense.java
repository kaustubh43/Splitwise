package com.example.splitwise.models;

import jakarta.persistence.*;
import lombok.*;

import javax.net.ssl.CertPathTrustManagerParameters;


@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="user_expense")
public class UserExpense extends BaseModel implements Comparable<UserExpense> {
    @ManyToOne
    @JoinColumn(name="expense_id")
    private Expense expense;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    Double amount;

    @Enumerated(EnumType.STRING)
    ExpenseType expenseType;

    @Override
    public int compareTo(UserExpense other) {
        return Double.compare(this.amount, other.amount);
    }
}
