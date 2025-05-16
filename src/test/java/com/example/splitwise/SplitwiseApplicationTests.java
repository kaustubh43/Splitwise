package com.example.splitwise;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SplitwiseApplicationTests {
    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void contextLoads() {
    }

    @Test
    void testUserSignupAndSignin() {
        // Signup
        String signupUrl = "/user/signup";
        String email = "testuser@example.com";
        String password = "password";
        String name = "Test User";
        String phone = "1234567890";
        String signupBody = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\",\"name\":\"%s\",\"phoneNumber\":\"%s\"}", email, password, name,
                phone);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(signupBody, headers);
        ResponseEntity<String> signupResponse = restTemplate.postForEntity(signupUrl, request, String.class);
        assertThat(signupResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Signin
        String signinUrl = "/user/signin";
        String signinBody = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
        request = new HttpEntity<>(signinBody, headers);
        ResponseEntity<Boolean> signinResponse = restTemplate.postForEntity(signinUrl, request, Boolean.class);
        assertThat(signinResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(signinResponse.getBody()).isTrue();
    }

    @Test
    void testCreateGroupAndAddUsers() {
        // Create user for group
        String email = "groupuser@example.com";
        String password = "password";
        String name = "Group User";
        String phone = "1111111111";
        String signupBody = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\",\"name\":\"%s\",\"phoneNumber\":\"%s\"}", email, password, name,
                phone);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(signupBody, headers);
        restTemplate.postForEntity("/user/signup", request, String.class);

        // Create group
        String groupName = "Test Group";
        String groupBody = String.format("{\"name\":\"%s\",\"userIds\":[1]}", groupName); // assumes userId=1
        request = new HttpEntity<>(groupBody, headers);
        ResponseEntity<String> groupResponse = restTemplate.postForEntity("/groups/creategroup", request, String.class);
        assertThat(groupResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void testCreateExpense() {
        // Create user and group first
        String email = "expenseuser@example.com";
        String password = "password";
        String name = "Expense User";
        String phone = "2222222222";
        String signupBody = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\",\"name\":\"%s\",\"phoneNumber\":\"%s\"}", email, password, name,
                phone);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(signupBody, headers);
        restTemplate.postForEntity("/user/signup", request, String.class);

        // Create group
        String groupBody = "{\"name\":\"Expense Group\",\"userIds\":[1]}";
        request = new HttpEntity<>(groupBody, headers);
        restTemplate.postForEntity("/groups/creategroup", request, String.class);

        // Create expense with correct JSON structure
        String expenseBody = "{\"name\":\"Lunch\",\"amount\":100,\"groupId\":1,\"paidBy\":{\"1\":100.0},\"owedBy\":{\"1\":100.0}}";
        request = new HttpEntity<>(expenseBody, headers);
        ResponseEntity<String> expenseResponse = restTemplate.postForEntity("/expenses/create", request, String.class);
        assertThat(expenseResponse.getStatusCode().is2xxSuccessful()).isTrue();
    }
}