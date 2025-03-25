package com.example.splitwise.strategies;

import com.example.splitwise.models.Expense;
import com.example.splitwise.models.ExpenseType;
import com.example.splitwise.models.User;
import com.example.splitwise.models.UserExpense;
import com.example.splitwise.repositories.UserExpenseRepository;

import java.util.*;

public class OptimalStrategy implements SettleUpStrategy {

    /*
    1. Get all owings per person.
    2. Create two Priority Queues, lender and borrower
    3. Pop and settle the topmost elements.
     */
    @Override
    public List<Transaction> settleUp(List<Expense> expenses) {
        Map<User, Double> owings = getOwings(expenses);

        PriorityQueue<UserExpense> lender = new PriorityQueue<>(Comparator.reverseOrder());
        PriorityQueue<UserExpense> borrower = new PriorityQueue<>(Comparator.reverseOrder());

        owings.forEach((user, amount) -> {
            UserExpense expense = UserExpense.builder()
                    .user(user)
                    .amount(amount)
                    .build();
           if(amount < 0){
                borrower.add(expense);
           }
           else{
               lender.add(expense);
           }
        });

        List<Transaction> transactions = new ArrayList<>();
        while(!borrower.isEmpty() && !lender.isEmpty()){
            UserExpense topBorrower = borrower.poll();
            UserExpense topLender = lender.poll();

            if(topLender.getAmount() > topBorrower.getAmount()){
                transactions.add(new Transaction(
                        topBorrower.getAmount(),
                        topBorrower.getUser(),
                        topLender.getUser())
                );
                topLender.setAmount(topLender.getAmount() - topBorrower.getAmount());
                lender.add(topLender);
            }
            else if(topLender.getAmount() < topBorrower.getAmount()){
                transactions.add(new Transaction(
                        topLender.getAmount(),
                        topBorrower.getUser(),
                        topLender.getUser()
                ));
                topBorrower.setAmount(topBorrower.getAmount() + topLender.getAmount());
            }
        }
        return transactions;
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
