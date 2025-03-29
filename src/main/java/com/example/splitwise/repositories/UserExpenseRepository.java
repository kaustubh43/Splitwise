package com.example.splitwise.repositories;

import com.example.splitwise.models.UserExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserExpenseRepository extends JpaRepository<UserExpense, Long> {
    List<UserExpense> findByExpense_Group_Id(Long id);
}
