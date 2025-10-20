package com.example.splitwise.exceptions;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public String handleIllegalArgumentException(IllegalArgumentException exception){
        return "{\"error\": \"" + exception.getMessage() + "\"}";
    }

    @ExceptionHandler(ExpenseNotExist.class)
    public String handleExpenseNotExist(ExpenseNotExist exception){
        return "{\"error\": \"" + exception.getMessage() + "\"}";
    }

    @ExceptionHandler(UserNotExist.class)
    public String handleUserNotExist(ExpenseNotExist exception){
        return "{\"error\": \"" + exception.getMessage() + "\"}";
    }
}
