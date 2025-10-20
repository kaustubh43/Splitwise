import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/api';
import { CreateExpenseRequest } from '../types';

const CreateExpense: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    groupId: 0,
    paidByEntries: '',
    owedByEntries: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  const parseUserAmountEntries = (entries: string): { [userId: string]: number } => {
    const result: { [userId: string]: number } = {};
    entries.split(',').forEach(entry => {
      const [userIdStr, amountStr] = entry.split(':').map(s => s.trim());
      const amount = parseFloat(amountStr);
      if (userIdStr && !isNaN(amount)) {
        result[userIdStr] = amount;  // Keep as string for proper Long serialization
      }
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const paidBy = parseUserAmountEntries(formData.paidByEntries);
      const owedBy = parseUserAmountEntries(formData.owedByEntries);

      // Validate that totals match
      const totalPaid = Object.values(paidBy).reduce((sum, amount) => sum + amount, 0);
      const totalOwed = Object.values(owedBy).reduce((sum, amount) => sum + amount, 0);

      if (Math.abs(totalPaid - formData.amount) > 0.01 || Math.abs(totalOwed - formData.amount) > 0.01) {
        setError('Total paid and total owed must equal the expense amount');
        setLoading(false);
        return;
      }

      const request: CreateExpenseRequest = {
        name: formData.name,
        amount: formData.amount,
        groupId: formData.groupId,
        paidBy,
        owedBy
      };

      const response = await expenseService.createExpense(request);
      setSuccess(`Expense "${response.expenseName}" created successfully in group "${response.groupName}"`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError('Failed to create expense. Please check your input and try again.');
      console.error('Create expense error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'groupId' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Create New Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Expense Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Dinner at Restaurant"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Total Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="groupId">Group ID:</label>
            <input
              type="number"
              id="groupId"
              name="groupId"
              value={formData.groupId || ''}
              onChange={handleInputChange}
              placeholder="Enter group ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paidByEntries">Paid By (userId:amount):</label>
            <input
              type="text"
              id="paidByEntries"
              name="paidByEntries"
              value={formData.paidByEntries}
              onChange={handleInputChange}
              placeholder="e.g., 1:50.00, 2:25.00"
              required
            />
            <small>Format: userId:amount, separated by commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="owedByEntries">Owed By (userId:amount):</label>
            <input
              type="text"
              id="owedByEntries"
              name="owedByEntries"
              value={formData.owedByEntries}
              onChange={handleInputChange}
              placeholder="e.g., 1:25.00, 2:25.00, 3:25.00"
              required
            />
            <small>Format: userId:amount, separated by commas</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Expense...' : 'Create Expense'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpense;
