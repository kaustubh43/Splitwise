package com.example.splitwise.strategies;

import com.example.splitwise.models.ExpenseType;
import com.example.splitwise.models.User;
import com.example.splitwise.models.UserExpense;

import java.util.*;

public class OptimalStrategy implements SettleUpStrategy {

    /*
     * 1. Get all owings per person.
     * 2. Create two Priority Queues, lender and borrower
     * 3. Pop and settle the topmost elements.
     */
    @Override
    public List<Transaction> settleUp(List<UserExpense> expenses) {
        Map<User, Double> owings = getOwings(expenses);

        // Map owings to queue
        PriorityQueue<UserExpense> lender = new PriorityQueue<>(Comparator.reverseOrder());
        PriorityQueue<UserExpense> borrower = new PriorityQueue<>(Comparator.reverseOrder());

        owings.forEach((user, amount) -> {
            UserExpense expense = UserExpense.builder()
                    .user(user)
                    .amount(amount)
                    .build();
            if (amount < 0) {
                expense.setAmount(expense.getAmount() * -1D);
                borrower.add(expense);
            } else {
                lender.add(expense);
            }
        });

        List<Transaction> transactions = new ArrayList<>();
        while (!borrower.isEmpty() && !lender.isEmpty()) {
            UserExpense topBorrower = borrower.poll();
            UserExpense topLender = lender.poll();

            double amountToSettle = Math.min(topBorrower.getAmount(), topLender.getAmount());

            // Always create transaction from borrower to lender
            transactions.add(new Transaction(
                    amountToSettle,
                    topBorrower.getUser(), // borrower pays
                    topLender.getUser() // lender receives
            ));

            // Handle remaining amounts
            if (topLender.getAmount() > amountToSettle) {
                topLender.setAmount(topLender.getAmount() - amountToSettle);
                lender.add(topLender); // Lender still needs to be paid more
            } else if (topBorrower.getAmount() > amountToSettle) {
                topBorrower.setAmount(topBorrower.getAmount() - amountToSettle);
                borrower.add(topBorrower); // Borrower still needs to pay more
            }
            // If amounts are equal, both are settled and we don't add them back to queues
        }
        return transactions;
    }

    public Map<User, Double> getOwings(List<UserExpense> expenses) {
        Map<User, Double> owings = new HashMap<>();

        for (UserExpense userExpense : expenses) {
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
