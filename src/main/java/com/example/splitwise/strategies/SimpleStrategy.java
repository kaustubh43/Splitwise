package com.example.splitwise.strategies;

import com.example.splitwise.models.UserExpense;
import com.example.splitwise.models.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import static com.example.splitwise.utils.OwingsManager.getOwings;

@Component("simpleStrategy")
public class SimpleStrategy implements SettleUpStrategy {

    @Override
    public List<Transaction> settleUp(List<UserExpense> expenses) {
        Map<User, Double> owings = getOwings(expenses);

        List<UserExpense> borrowers = new ArrayList<>();
        List<UserExpense> lenders = new ArrayList<>();

        // Separate borrowers and lenders
        owings.forEach((user, amount) -> {
            if (amount < 0) {
                borrowers.add(UserExpense.builder()
                        .user(user)
                        .amount(-amount)
                        .build());
            } else if (amount > 0) {
                lenders.add(UserExpense.builder()
                        .user(user)
                        .amount(amount)
                        .build());
            }
        });

        // Sort for consistent ordering (by user name)
        borrowers.sort(Comparator.comparing(ue -> ue.getUser().getName()));
        lenders.sort(Comparator.comparing(ue -> ue.getUser().getName()));

        List<Transaction> transactions = new ArrayList<>();

        // Settlement using nested loops
        for (UserExpense borrower : borrowers) {
            for (UserExpense lender : lenders) {
                if (borrower.getAmount() <= 0 || lender.getAmount() <= 0) {
                    continue;
                }

                double settleAmount = Math.min(borrower.getAmount(), lender.getAmount());

                transactions.add(new Transaction(
                        settleAmount,
                        borrower.getUser(),
                        lender.getUser()
                ));

                borrower.setAmount(borrower.getAmount() - settleAmount);
                lender.setAmount(lender.getAmount() - settleAmount);
            }
        }

        return transactions;
    }
}