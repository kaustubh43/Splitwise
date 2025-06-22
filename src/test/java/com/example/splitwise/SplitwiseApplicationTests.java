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
        // Create user for the group
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

        // Create a group
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

        // Create a group
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

        // Create users - these will have IDs 4, 5, 6 since other tests create users 1, 2, 3
        createUser("kaustubh@example.com", "Kaustubh Ajgaonkar", "1111111111", headers);  // userId: 4
        createUser("rutwik@example.com", "Rutwik", "2222222222", headers);                // userId: 5
        createUser("utsav@example.com", "Utsav", "3333333333", headers);                  // userId: 6

        // Create a group with the correct user IDs
        String groupBody = "{\"name\":\"Trip Group\",\"userIds\":[4,5,6]}";
        HttpEntity<String> request = new HttpEntity<>(groupBody, headers);
        ResponseEntity<String> groupResponse = restTemplate.postForEntity("/groups/creategroup", request, String.class);
        assertThat(groupResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Add expenses with the correct user IDs
        // 1. Tea - Paid by Kaustubh (100), split equally among all 3
        addExpense("Tea", 100.0, 1,
            "{\"4\":100.0}", 
            "{\"4\":33.33,\"5\":33.33,\"6\":33.34}", headers);

        // 2. Snacks - Paid by Kaustubh (500), split equally among all 3
        addExpense("Snacks", 500.0, 1,
            "{\"4\":500.0}",
            "{\"4\":166.67,\"5\":166.67,\"6\":166.66}", headers);

        // 3. Tea and Snacks - Paid by Utsav (60), split equally among all 3
        addExpense("Tea and Snacks", 60.0, 1,
            "{\"6\":60.0}",
            "{\"4\":20.0,\"5\":20.0,\"6\":20.0}", headers);

        // 4. Pizza - Paid by Utsav (1800), split equally among all 3
        addExpense("Pizza", 1800.0, 1,
            "{\"6\":1800.0}",
            "{\"4\":600.0,\"5\":600.0,\"6\":600.0}", headers);

        // 5. Flights - Paid by all (15000), split equally among all 3
        addExpense("Flights", 15000.0, 1,
            "{\"4\":5000.0,\"5\":5000.0,\"6\":5000.0}",
            "{\"4\":5000.0,\"5\":5000.0,\"6\":5000.0}", headers);

        // 6. Drinks - Paid by Utsav (900) and Kaustubh(900), split equally among all 3
        // Test multiple paidBy entries
        addExpense("Drinks", 1800.0, 1,
            "{\"6\":900.0, \"4\":900.0}",
            "{\"4\":600.0,\"5\":600.0,\"6\":600.0}", headers);

        // Get settlement transactions
        ResponseEntity<String> balanceResponse = restTemplate.getForEntity("/groups/1/settleup", String.class);
        assertThat(balanceResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        
        // Assert the expected settlement transactions
        String expectedSettlement = "[{\"paidBy\":\"Rutwik\",\"paidTo\":\"Utsav\",\"amount\":1340.0}," +
                "{\"paidBy\":\"Rutwik\",\"paidTo\":\"Kaustubh Ajgaonkar\",\"amount\":80.0}]";
        assertThat(balanceResponse.getBody()).isEqualTo(expectedSettlement);
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