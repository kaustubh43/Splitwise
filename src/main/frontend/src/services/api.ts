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

export const userService = {
  signUp: async (request: SignUpRequest): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>('/user/signup', request);
    return response.data;
  },

  signIn: async (request: SignInRequest): Promise<boolean> => {
    const response = await api.post<boolean>('/user/signin', request);
    return response.data;
  },
};

export const groupService = {
  createGroup: async (request: GroupRequest): Promise<GroupResponse> => {
    const response = await api.post<GroupResponse>('/groups/creategroup', request);
    return response.data;
  },

  addUsers: async (request: GroupAddUsersRequest): Promise<boolean> => {
    const response = await api.patch<boolean>('/groups/addusers', request);
    return response.data;
  },

  settleUp: async (groupId: number): Promise<SettlementTransaction[]> => {
    const response = await api.get<SettlementTransaction[]>(`/groups/${groupId}/settleup`);
    return response.data;
  },
};

export const expenseService = {
  createExpense: async (request: CreateExpenseRequest): Promise<CreateExpenseResponse> => {
    const response = await api.post<CreateExpenseResponse>('/expenses/create', request);
    return response.data;
  },

  viewExpense: async (expenseId: number): Promise<ViewExpenseResponse> => {
    const response = await api.get<ViewExpenseResponse>(`/expenses/viewexpense/${expenseId}`);
    return response.data;
  },
};
