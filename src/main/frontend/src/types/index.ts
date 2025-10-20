// TypeScript interfaces matching the backend DTOs

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: number;
}

export interface SignUpResponse {
  id: number;
  email: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface GroupRequest {
  name: string;
  userIds: string[];  // Changed to string[] to properly serialize as Long[] in Java
}

export interface GroupResponse {
  groupId: number;
  name: string;
  members: string[];
}

export interface GroupAddUsersRequest {
  groupId: number;
  userIds: string[];  // Changed to string[] to properly serialize as Long[] in Java
}

export interface CreateExpenseRequest {
  name: string;
  amount: number;
  groupId: number;
  paidBy: { [userId: string]: number };  // Changed to string to match Long serialization
  owedBy: { [userId: string]: number };  // Changed to string to match Long serialization
}

export interface CreateExpenseResponse {
  expenseName: string;
  expenseId: number;
  amount: number;
  groupName: string;
  owedByMap: { [userName: string]: number };
  paidByMap: { [userName: string]: number };
}

export interface ViewExpenseRequest {
  id: number;
}

export interface ViewExpenseResponse {
  name: string;
  id: number;
  amount: number;
  paidBy: { [userName: string]: number };
  owedBy: { [userName: string]: number };
}

export interface SettlementTransaction {
  paidBy: string;
  paidTo: string;
  amount: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: number;
}
