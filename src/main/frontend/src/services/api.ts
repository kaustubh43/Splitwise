import axios from 'axios';
import {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  GroupRequest,
  GroupResponse,
  GroupAddUsersRequest,
  CreateExpenseRequest,
  CreateExpenseResponse,
  ViewExpenseRequest,
  ViewExpenseResponse,
  SettlementTransaction
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await api.post<SignUpResponse>('/user/signup', data);
  return response.data;
};

export const signIn = async (data: SignInRequest): Promise<boolean> => {
  const response = await api.post<boolean>('/user/signin', data);
  return response.data;
};

// Group APIs
export const createGroup = async (data: GroupRequest): Promise<GroupResponse> => {
  const response = await api.post<GroupResponse>('/groups/creategroup', data);
  return response.data;
};

export const addUsersToGroup = async (data: GroupAddUsersRequest): Promise<boolean> => {
  const response = await api.patch<boolean>('/groups/addusers', data);
  return response.data;
};

export const settleUpGroup = async (groupId: number): Promise<SettlementTransaction[]> => {
  const response = await api.get<SettlementTransaction[]>(`/groups/${groupId}/settleup`);
  return response.data;
};

export const viewGroupExpenses = async (groupId: number): Promise<ViewExpenseResponse[]> => {
  const response = await api.get<ViewExpenseResponse[]>(`/groups/${groupId}/viewexpenses`);
  return response.data;
};

// Expense APIs
export const createExpense = async (data: CreateExpenseRequest): Promise<CreateExpenseResponse> => {
  const response = await api.post<CreateExpenseResponse>('/expenses/create', data);
  return response.data;
};

export const viewExpense = async (expenseId: number): Promise<ViewExpenseResponse> => {
  const response = await api.get<ViewExpenseResponse>(`/expenses/${expenseId}/viewexpense`);
  return response.data;
};

// Service objects for backward compatibility with components
export const userService = {
  signUp,
  signIn
};

export const groupService = {
  createGroup,
  addUsersToGroup,
  settleUpGroup,
  settleUp: settleUpGroup, // Alias for backward compatibility
  viewGroupExpenses
};

export const expenseService = {
  createExpense,
  viewExpense
};

export default api;
