package com.example.splitwise.controllers;

import com.example.splitwise.dtos.*;
import com.example.splitwise.exceptions.GroupNotExist;
import com.example.splitwise.exceptions.UserAlreadyInGroup;
import com.example.splitwise.exceptions.UserNotExist;
import com.example.splitwise.models.*;
import com.example.splitwise.services.GroupService;
import com.example.splitwise.strategies.Transaction;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/creategroup")
    @ResponseStatus(HttpStatus.CREATED)
    public @ResponseBody GroupResponse createGroup(@RequestBody GroupRequest group) {
        Group newGroup = groupService.createGroup(group.getName(), group.getUserIds());
        return GroupResponse.builder()
                .groupId(newGroup.getId())
                .name(newGroup.getName())
                .members(newGroup.getUsers().stream().map((User::getName)).collect(Collectors.toList()))
                .build();
    }

    @PatchMapping("/addusers")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public @ResponseBody boolean addUsers(@RequestBody GroupAddUsersRequest request) throws GroupNotExist, UserNotExist, UserAlreadyInGroup {
        Group addedToGroup = groupService.addToGroup(request.getGroupId(), request.getUserIds());
        return addedToGroup != null;
    }

    @GetMapping("/{groupId}/settleup")
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody List<SettlementTransaction> settleUp(@PathVariable Long groupId) throws GroupNotExist {
        List<Transaction> settlementTransactions = groupService.settleUp(groupId);
        List<SettlementTransaction> response = new ArrayList<>();

        // Traverse all transactions and build dto.
        for(Transaction transaction : settlementTransactions) {
            SettlementTransaction payment = SettlementTransaction.builder()
                    .paidBy(transaction.getPaidBy().getName())
                    .paidTo(transaction.getPaidTo().getName())
                    .amount(transaction.getAmount())
                    .build();
            response.add(payment);
        }
        return response;


//        // Convert transactions into final balances
//        Map<String, Double> finalBalances = new HashMap<>();
//
//        // First, aggregate all the expenses
//        for (Transaction transaction : settlementTransactions) {
//            // For the payer, add to their balance
//            finalBalances.merge(String.valueOf(transaction.getPaidBy().getName()),
//                    transaction.getAmount(), Double::sum);
//
//            // For the receiver, subtract from their balance
//            finalBalances.merge(String.valueOf(transaction.getPaidTo().getName()),
//                    -transaction.getAmount(), Double::sum);
//        }
//
//        return finalBalances;
    }

    @GetMapping("/{groupId}/viewexpenses")
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody List<ViewExpenseResponse> viewExpense(@PathVariable Long groupId) {
        List<Expense> expenses = groupService.viewExpenses(groupId);
        return expenses.stream().map(this::from).collect(Collectors.toList());
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody List<GroupResponse> getAllGroups() {
        List<Group> groups = groupService.getAllGroups();
        return groups.stream().map(group -> GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .members(group.getUsers().stream().map(User::getName).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());
    }

    public ViewExpenseResponse from(Expense expense) {
        ViewExpenseResponse viewExpenseResponse = ViewExpenseResponse.builder()
                .name(expense.getName())
                .id(expense.getId())
                .amount(expense.getAmount())
                .build();

        Map<String, Double> paidByMap = new HashMap<>();
        Map<String, Double> owedByMap = new HashMap<>();

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
