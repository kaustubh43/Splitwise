package com.example.splitwise.repositories;

import com.example.splitwise.models.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroup_Id(Long id);
}
