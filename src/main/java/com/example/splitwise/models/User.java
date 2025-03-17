package com.example.splitwise.models;

import jakarta.persistence.Entity;
import jakarta.persistence.PostPersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Entity
@Getter
@Builder
@AllArgsConstructor
public class User extends BaseModel {
    String email;
    String password;

    @PostPersist
    public void onCreation() {
        System.out.println("User created :: " + this.email);
    }
}
