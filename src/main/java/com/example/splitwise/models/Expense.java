package com.example.splitwise.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
public class Expense extends BaseModel {
    String name;
    Double amount;

    @ManyToOne
    @JoinColumn(name="group_id")
    Group group;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "expense", cascade = CascadeType.ALL)
    List<UserExpense> paidBy;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "expense", cascade = CascadeType.ALL)
    List<UserExpense> owedBy;
}
