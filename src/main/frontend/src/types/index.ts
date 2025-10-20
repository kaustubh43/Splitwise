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
  paidBy: { [userId: number]: number };  // userId as number to match backend Long
  owedBy: { [userId: number]: number };  // userId as number to match backend Long
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
  id: number;
  name: string;
  amount: number;
  paidBy: { [key: string]: number };
  owedBy: { [key: string]: number };
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Group {
  groupId: number;
  name: string;
  members: string[];
}

export interface SettlementTransaction {
  paidBy: string;
  paidTo: string;
  amount: number;
}
