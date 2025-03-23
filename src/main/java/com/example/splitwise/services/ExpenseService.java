package com.example.splitwise.services;

import com.example.splitwise.dtos.CreateExpenseRequest;
import com.example.splitwise.exceptions.ExpenseNotExist;
import com.example.splitwise.exceptions.GroupNotExist;
import com.example.splitwise.exceptions.UserNotExist;
import com.example.splitwise.models.*;
import com.example.splitwise.repositories.ExpenseRepository;
import com.example.splitwise.repositories.GroupRepository;
import com.example.splitwise.repositories.UserExpenseRepository;
import com.example.splitwise.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional(rollbackFor = {UserNotExist.class, GroupNotExist.class})
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final UserExpenseRepository userExpenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository, GroupRepository groupRepository, UserRepository userRepository, UserExpenseRepository userExpenseRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.userExpenseRepository = userExpenseRepository;
    }

    public Expense createExpense(CreateExpenseRequest createExpenseRequest) throws UserNotExist, GroupNotExist {
        Optional<Group> group = groupRepository.findById(createExpenseRequest.getGroupId());
        if(group.isEmpty()) {
            throw new GroupNotExist("Group is not existing");
        }

        Expense expense = Expense.builder()
                .name(createExpenseRequest.getName())
                .amount(createExpenseRequest.getAmount())
                .group(group.get())
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        // Handle paid by.
        List<UserExpense> userExpenses = new ArrayList<>();
        for(Map.Entry<Long, Double> entry: createExpenseRequest.getPaidBy().entrySet()){
            Long userId = entry.getKey();
            Double amount = entry.getValue();
            Optional<User> user = userRepository.findById(userId);
            if(user.isEmpty()) throw new UserNotExist("User not found");
            userExpenses.add(new UserExpense(expense, user.get(), amount, ExpenseType.PAID_BY));
        }

        // Handle owed by.
        for(Map.Entry<Long, Double> entry: createExpenseRequest.getOwedBy().entrySet()){
            Long userId = entry.getKey();
            Double amount = entry.getValue();
            Optional<User> user = userRepository.findById(userId);
            if(user.isEmpty()) throw new UserNotExist("User not found");
            // negative amount denotes that the amount is owed.
            userExpenses.add(new UserExpense(expense, user.get(), amount, ExpenseType.OWED_BY));
        }

        // Set userExpenses attribute in Expense entity.
        savedExpense.setUserExpenses(userExpenses);

        // Save all user expenses.
        userExpenseRepository.saveAll(userExpenses);

        return expenseRepository.save(savedExpense);
    }

    public Expense viewExpense(Long id) throws ExpenseNotExist {
        Optional<Expense> checkExpense = expenseRepository.findById(id);
        if(checkExpense.isEmpty()) {
            throw new ExpenseNotExist("Expense does not Exist");
        }
        return checkExpense.get();
    }
}