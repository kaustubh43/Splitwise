import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/api';
import { ViewExpenseRequest, ViewExpenseResponse } from '../types';

const ViewExpense: React.FC = () => {
  const [expenseId, setExpenseId] = useState<number>(0);
  const [expense, setExpense] = useState<ViewExpenseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExpense(null);

    try {
      const request: ViewExpenseRequest = { id: expenseId };
      const response = await expenseService.viewExpense(request);
      setExpense(response);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Expense not found');
      } else {
        setError('Failed to fetch expense details');
      }
      console.error('View expense error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>View Expense Details</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="expenseId">Expense ID:</label>
            <input
              type="number"
              id="expenseId"
              value={expenseId || ''}
              onChange={(e) => setExpenseId(parseInt(e.target.value) || 0)}
              placeholder="Enter expense ID"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'View Expense'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {expense && (
          <div className="expense-details">
            <h3>Expense Details</h3>
            <div className="expense-info">
              <p><strong>Name:</strong> {expense.name}</p>
              <p><strong>Amount:</strong> ${expense.amount.toFixed(2)}</p>
              <p><strong>ID:</strong> {expense.id}</p>
            </div>

            <div className="expense-breakdown">
              <div className="paid-by-section">
                <h4>Paid By:</h4>
                {Object.entries(expense.paidBy).length > 0 ? (
                  <ul>
                    {Object.entries(expense.paidBy).map(([user, amount]) => (
                      <li key={user}>
                        {user}: ${amount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No payment information available</p>
                )}
              </div>

              <div className="owed-by-section">
                <h4>Owed By:</h4>
                {Object.entries(expense.owedBy).length > 0 ? (
                  <ul>
                    {Object.entries(expense.owedBy).map(([user, amount]) => (
                      <li key={user}>
                        {user}: ${amount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No owing information available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExpense;
