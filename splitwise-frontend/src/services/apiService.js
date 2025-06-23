import axios from 'axios';

const BASE_URL = 'http://localhost:8080'; // Adjust to your Spring Boot port

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// User API calls
export const userService = {
    getAllUsers: () => api.get('/user'),
    createUser: (userData) => api.post('/user/signup', userData),
    getUserById: (id) => api.get(`/user/${id}`),
    updateUser: (id, userData) => api.put(`/user/${id}`, userData),
    deleteUser: (id) => api.delete(`/user/${id}`),
    signIn: (userData) => api.post('/user/signin', userData)
};

// Group API calls
export const groupService = {
    getAllGroups: () => api.get('/groups'),
    createGroup: (groupData) => api.post('/groups/creategroup', groupData),
    getGroupById: (id) => api.get(`/groups/${id}`),
    addUserToGroup: (groupId, userIds) => api.patch('/groups/addusers', { groupId, userIds }),
    removeUserFromGroup: (groupId, userId) => api.delete(`/groups/${groupId}/users/${userId}`),
    settleUp: (groupId) => api.get(`/groups/${groupId}/settleup`)
};

// Expense API calls
export const expenseService = {
    getAllExpenses: () => api.get('/expenses'),
    createExpense: (expenseData) => api.post('/expenses/create', expenseData),
    getExpenseById: (id) => api.get(`/expenses/viewexpense`, { data: { id } }),
    updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
    deleteExpense: (id) => api.delete(`/expenses/${id}`),
    getExpensesByGroup: (groupId) => api.get(`/expenses/group/${groupId}`)
};

// Transaction API calls
export const transactionService = {
    getAllTransactions: () => api.get('/transactions'),
    getTransactionsByGroup: (groupId) => api.get(`/transactions/group/${groupId}`),
    settleTransaction: (transactionId) => api.post(`/transactions/${transactionId}/settle`)
};

// Error handling interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;