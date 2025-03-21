package com.example.splitwise.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "splitwise_user")
public class User extends BaseModel {
    @Column(nullable = false, unique = true)
    String email;
    String password;
    String name;
    Long phoneNumber;

    @PostPersist
    public void onCreation() {
        System.out.println("User created :: " + this.email);
    }
}
