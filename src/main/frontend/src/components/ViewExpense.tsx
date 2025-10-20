import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService } from '../services/api';
import { ViewExpenseResponse } from '../types';
import './ViewExpense.css';

const ViewExpense: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [expenses, setExpenses] = useState<ViewExpenseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  const fetchExpenses = async () => {
    if (!groupId) return;

    setLoading(true);
    setError('');

    try {
      const response = await groupService.viewGroupExpenses(parseInt(groupId));
      setExpenses(response);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Group not found or has no expenses');
      } else {
        setError('Failed to fetch expenses');
      }
      console.error('Fetch expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderUserAmounts = (userAmountMap: { [key: string]: number } | undefined | null) => {
    if (!userAmountMap || Object.keys(userAmountMap).length === 0) {
      return <div className="user-amount"><span className="user-name">No data available</span></div>;
    }

    return Object.entries(userAmountMap).map(([user, amount]) => (
      <div key={user} className="user-amount">
        <span className="user-name">{user}</span>
        <span className="amount">{formatCurrency(amount)}</span>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="view-expense-container">
        <div className="loading">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="view-expense-container">
      <div className="view-expense-header">
        <h1>Group Expenses (Group ID: {groupId})</h1>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!error && expenses.length === 0 && (
        <div className="no-expenses">
          <p>No expenses found for this group.</p>
          <button onClick={() => navigate('/create-expense')} className="create-expense-btn">
            Create First Expense
          </button>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="expenses-list">
          <div className="expenses-summary">
            <h3>Total Expenses: {expenses.length}</h3>
            <h3>Total Amount: {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}</h3>
          </div>

          {expenses.map((expense) => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <h3>{expense.name}</h3>
                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
              </div>

              <div className="expense-details">
                <div className="expense-section">
                  <h4>Paid By:</h4>
                  <div className="user-amounts">
                    {renderUserAmounts(expense.paidBy)}
                  </div>
                </div>

                <div className="expense-section">
                  <h4>Owed By:</h4>
                  <div className="user-amounts">
                    {renderUserAmounts(expense.owedBy)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="action-buttons">
        <button onClick={() => navigate('/create-expense')} className="primary-btn">
          Add New Expense
        </button>
        <button onClick={() => navigate(`/settlement/${groupId}`)} className="secondary-btn">
          View Settlement
        </button>
      </div>
    </div>
  );
};

export default ViewExpense;
