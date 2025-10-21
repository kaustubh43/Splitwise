import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import CreateGroup from './components/CreateGroup';
import CreateExpense from './components/CreateExpense';
import ViewExpense from './components/ViewExpense';
import Settlement from './components/Settlement';
import SettleGroup from './components/SettleGroup';
import AddUsersToGroup from './components/AddUsersToGroup';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Splitwise</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/create-expense" element={<CreateExpense />} />
            <Route path="/view-expenses/:groupId" element={<ViewExpense />} />
            <Route path="/settlement/:groupId" element={<Settlement />} />
            <Route path="/settle-group" element={<SettleGroup />} />
            <Route path="/add-users-to-group" element={<AddUsersToGroup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
