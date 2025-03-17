package com.example.splitwise.exceptions;

public class UserAlreadyExists extends Exception {
    public UserAlreadyExists() {
        super("User already exists, try using different email address");
    }
}
