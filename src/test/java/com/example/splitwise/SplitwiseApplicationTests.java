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

    @Test
    void testGroupTripExpenses() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create users
        createUser("kaustubh@example.com", "Kaustubh Ajgaonkar", "1111111111", headers);  // userId: 1
        createUser("rutwik@example.com", "Rutwik", "2222222222", headers);                // userId: 2
        createUser("utsav@example.com", "Utsav", "3333333333", headers);                  // userId: 3

        // Create group
        String groupBody = "{\"name\":\"Trip Group\",\"userIds\":[1,2,3]}";
        HttpEntity<String> request = new HttpEntity<>(groupBody, headers);
        ResponseEntity<String> groupResponse = restTemplate.postForEntity("/groups/creategroup", request, String.class);
        assertThat(groupResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Add expenses
        // 1. Sutta - Paid by Kaustubh
        addExpense("Sutta", 100.0, 1, 
            "{\"1\":100.0}", 
            "{\"1\":60.0,\"2\":-40.0,\"3\":-20.0}", headers);

        // 2. Snacks - Paid by Kaustubh
        addExpense("Snacks", 500.0, 1,
            "{\"1\":500.0}",
            "{\"1\":250.0,\"2\":-100.0,\"3\":-150.0}", headers);

        // 3. Sutta Break - Paid by Utsav
        addExpense("Sutta Break", 60.0, 1,
            "{\"3\":60.0}",
            "{\"1\":-20.0,\"2\":-20.0,\"3\":40.0}", headers);

        // 4. Pizza - Paid by Utsav
        addExpense("Pizza", 1800.0, 1,
            "{\"3\":1800.0}",
            "{\"1\":-900.0,\"2\":-250.0,\"3\":1150.0}", headers);

        // 5. Flights - Paid by all
        addExpense("Flights", 15000.0, 1,
            "{\"1\":5000.0,\"2\":5000.0,\"3\":5000.0}",
            "{\"1\":2500.0,\"2\":2500.0,\"3\":-5000.0}", headers);

        // 6. Drink - Paid by Utsav
        addExpense("Drink", 1800.0, 1,
            "{\"3\":1800.0}",
            "{\"1\":-750.0,\"2\":-250.0,\"3\":1000.0}", headers);

        // Get final balances
        ResponseEntity<String> balanceResponse = restTemplate.getForEntity("/groups/1/settleup", String.class);
        assertThat(balanceResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        
        // Verify final balances
        // Kaustubh should have: 1140
        // Rutwik should have: 1840
        // Utsav should have: -2980
        String expectedBalance = "{\"1\":1140.0,\"2\":1840.0,\"3\":-2980.0}";
        assertThat(balanceResponse.getBody()).isEqualTo(expectedBalance);
    }

    private void createUser(String email, String name, String phone, HttpHeaders headers) {
        String signupBody = String.format(
                "{\"email\":\"%s\",\"password\":\"password\",\"name\":\"%s\",\"phoneNumber\":\"%s\"}", 
                email, name, phone);
        HttpEntity<String> request = new HttpEntity<>(signupBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity("/user/signup", request, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    private void addExpense(String name, double amount, long groupId, String paidBy, String owedBy, HttpHeaders headers) {
        String expenseBody = String.format(
                "{\"name\":\"%s\",\"amount\":%.1f,\"groupId\":%d,\"paidBy\":%s,\"owedBy\":%s}",
                name, amount, groupId, paidBy, owedBy);
        HttpEntity<String> request = new HttpEntity<>(expenseBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity("/expenses/create", request, String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
    }
}