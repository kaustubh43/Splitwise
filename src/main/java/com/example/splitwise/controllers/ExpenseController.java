package com.example.splitwise.controllers;

import com.example.splitwise.dtos.CreateExpenseRequest;
import com.example.splitwise.dtos.CreateExpenseResponse;
import com.example.splitwise.dtos.ViewExpenseRequest;
import com.example.splitwise.dtos.ViewExpenseResponse;
import com.example.splitwise.exceptions.ExpenseNotExist;
import com.example.splitwise.exceptions.GroupNotExist;
import com.example.splitwise.exceptions.UserNotExist;
import com.example.splitwise.models.Expense;
import com.example.splitwise.models.ExpenseType;
import com.example.splitwise.models.User;
import com.example.splitwise.models.UserExpense;
import com.example.splitwise.services.ExpenseService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/create")
    public @ResponseBody CreateExpenseResponse createExpense(@RequestBody CreateExpenseRequest expense) throws UserNotExist, GroupNotExist {
        Expense createdExpense;
        if (!validateExpenseRequest(expense)) {
            throw new IllegalArgumentException("Invalid expense request data: Total paid does not equal total owed.");
        }
        createdExpense = expenseService.createExpense(expense);
        // Building map for DTO.
        Map<String, Double> owedBy = new HashMap<>();
        Map<String, Double> paidBy = new HashMap<>();
        for(UserExpense userExpense : createdExpense.getUserExpenses()) {
            if(userExpense.getExpenseType() == ExpenseType.OWED_BY) {
                owedBy.put(userExpense.getUser().getName(), userExpense.getAmount());
            }
            else if(userExpense.getExpenseType() == ExpenseType.PAID_BY) {
                paidBy.put(userExpense.getUser().getName(), userExpense.getAmount());
            }
        }
        return CreateExpenseResponse.builder()
                .expenseName(createdExpense.getName())
                .expenseId(createdExpense.getId())
                .amount(createdExpense.getAmount())
                .groupName(createdExpense.getGroup().getName())
                .owedByMap(owedBy)
                .paidByMap(paidBy)
                .build();
    }

    @GetMapping("/viewexpense")
    public @ResponseBody ViewExpenseResponse viewExpense(@RequestBody ViewExpenseRequest viewExpense) throws ExpenseNotExist {
        Expense expense = expenseService.viewExpense(viewExpense.getId());
        ViewExpenseResponse viewExpenseResponse = ViewExpenseResponse.builder()
                .name(expense.getName())
                .id(expense.getId())
                .amount(expense.getAmount())
                .build();

        Map<String, Double> paidByMap = new HashMap<>();
        Map<String, Double> owedByMap = new HashMap<>();

        // Handle Owed by - note that your service stores these as negative values
        for(UserExpense userExpense: expense.getUserExpenses()){
            User user = userExpense.getUser();
            // Convert negative amounts to positive for the response
            Double amount = Math.abs(userExpense.getAmount());
            if(userExpense.getExpenseType() == ExpenseType.PAID_BY)
                paidByMap.put(user.getName(), amount);
            else if(userExpense.getExpenseType() == ExpenseType.OWED_BY)
                owedByMap.put(user.getName(), amount);
        }

        viewExpenseResponse.setPaidBy(paidByMap);
        viewExpenseResponse.setOwedBy(owedByMap);
        return viewExpenseResponse;
    }

    private boolean validateExpenseRequest(CreateExpenseRequest expense) {
        Double totalPaid = 0.0;
        Double totalOwed = 0.0;
       for(Map.Entry<Long, Double> entry : expense.getOwedBy().entrySet()) {
            totalOwed += entry.getValue();
       }
       for(Map.Entry<Long, Double> entry : expense.getPaidBy().entrySet()) {
           totalPaid += entry.getValue();
       }
       return totalPaid.equals(totalOwed) && totalPaid.equals(expense.getAmount());
    }
}
