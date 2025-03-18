package com.example.splitwise.exceptions;

public class UserNotExist extends Exception {
    public UserNotExist() {
        super("User not exist, please sign up first");
    }
}
