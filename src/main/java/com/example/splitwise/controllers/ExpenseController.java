package com.example.splitwise.controllers;

import com.example.splitwise.dtos.CreateExpenseDto;
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
    public @ResponseBody Expense createExpense(@RequestBody CreateExpenseDto expense) throws UserNotExist, GroupNotExist { // Todo: make a new dto for response.
        return expenseService.createExpense(expense);
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
}
