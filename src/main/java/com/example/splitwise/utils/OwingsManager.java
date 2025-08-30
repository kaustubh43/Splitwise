package com.example.splitwise.utils;

import com.example.splitwise.models.ExpenseType;
import com.example.splitwise.models.User;
import com.example.splitwise.models.UserExpense;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OwingsManager {
    /**
     * Calculates the net balance (owings) for each user based on their expenses.
     *
     * For each UserExpense, if the type is PAID_BY, the amount is added to the user's balance.
     * If the type is OWED_BY, the amount is subtracted from the user's balance.
     *
     * @param userExpenses List of UserExpense objects representing all expenses in the group
     * @return Map of User to their net balance (positive means the user is owed money, negative means the user owes money)
     */
    public static Map<User, Double> getOwings(List<UserExpense> userExpenses) {
        Map<User, Double> owings = new HashMap<>();

        for (UserExpense userExpense : userExpenses) {
            if (!owings.containsKey(userExpense.getUser())) {
                owings.put(userExpense.getUser(), 0D);
            }
            Double amount = userExpense.getExpenseType() == ExpenseType.PAID_BY ? userExpense.getAmount()
                    : userExpense.getAmount() * -1D;
            owings.put(userExpense.getUser(), owings.get(userExpense.getUser()) + amount);
        }
        return owings;
    }
}
