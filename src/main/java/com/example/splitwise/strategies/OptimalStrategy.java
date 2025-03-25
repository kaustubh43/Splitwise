package com.example.splitwise.strategies;

import com.example.splitwise.models.Expense;
import com.example.splitwise.models.ExpenseType;
import com.example.splitwise.models.User;
import com.example.splitwise.models.UserExpense;
import com.example.splitwise.repositories.UserExpenseRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OptimalStrategy implements SettleUpStrategy {

    @Override
    public List<Transaction> settleUp(List<Expense> expenses) {
        Map<User, Double> owings = getOwings(expenses);

        return null;
    }

    public Map<User, Double> getOwings(List<Expense> expenses){
        Map<User, Double> owings = new HashMap<>();

        for(Expense expense : expenses){
            for(UserExpense userExpense : expense.getUserExpenses()){
                if(owings.containsKey(userExpense.getUser())){
                    // Amount is calculated based on the
                    Double amount = userExpense.getExpenseType() == ExpenseType.PAID_BY ? userExpense.getAmount() : -userExpense.getAmount();
                    owings.put(userExpense.getUser(), owings.get(userExpense.getUser()) + amount);
                }
                else{
                    owings.put(userExpense.getUser(), 0D);
                }
            }
        }
        return owings;
    }
}
