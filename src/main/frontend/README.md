# Splitwise Frontend

A React TypeScript frontend application for the Splitwise expense sharing platform.

## Features

- **User Authentication**: Sign up and sign in functionality
- **Group Management**: Create groups and add users to groups
- **Expense Management**: Create and view expenses with split calculations
- **Settlement**: View settlement transactions to see who owes what
- **Responsive Design**: Works on desktop and mobile devices

## API Integration

The frontend integrates with the Spring Boot backend using the following endpoints:

### User Endpoints
- `POST /user/signup` - Register a new user
- `POST /user/signin` - Sign in an existing user

### Group Endpoints
- `POST /groups/creategroup` - Create a new group
- `PATCH /groups/addusers` - Add users to an existing group
- `GET /groups/{groupId}/settleup` - Get settlement transactions for a group

### Expense Endpoints
- `POST /expenses/create` - Create a new expense
- `GET /expenses/viewexpense` - View expense details

## Components

1. **Login** - User authentication
2. **SignUp** - User registration
3. **Dashboard** - Main navigation hub
4. **CreateGroup** - Create new expense groups
5. **CreateExpense** - Add new expenses to groups
6. **ViewExpense** - View details of existing expenses
7. **Settlement** - View settlement calculations

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd src/main/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Configuration

The frontend is configured to connect to the Spring Boot backend at `http://localhost:8080`. Make sure your backend server is running on this port.

## Technologies Used

- React 18 with TypeScript
- React Router for navigation
- Axios for HTTP requests
- CSS3 for styling
- Responsive design principles

## File Structure

```
src/
├── components/           # React components
│   ├── Login.tsx
│   ├── SignUp.tsx
│   ├── Dashboard.tsx
│   ├── CreateGroup.tsx
│   ├── CreateExpense.tsx
│   ├── ViewExpense.tsx
│   └── Settlement.tsx
├── services/            # API service layer
│   └── api.ts
├── types/              # TypeScript interfaces
│   └── index.ts
├── App.tsx             # Main app component
├── App.css             # Styling
└── index.tsx           # Entry point
```
