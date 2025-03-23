package com.example.splitwise.repositories;

import com.example.splitwise.models.Expense;
import com.example.splitwise.models.UserExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserExpenseRepository extends JpaRepository<UserExpense, Long> {
    List<UserExpense> findUserExpenseById(Long id);

    List<UserExpense> findAllByExpense(Expense expense);
}
