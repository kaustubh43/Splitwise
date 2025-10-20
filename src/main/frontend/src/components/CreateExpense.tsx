import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/api';
import { CreateExpenseRequest } from '../types';
import './CreateExpense.css';

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

  const parseUserAmountEntries = (entries: string): { [userId: number]: number } => {
    const result: { [userId: number]: number } = {};
    const trimmedEntries = entries.trim();

    if (!trimmedEntries) {
      return result;
    }

    trimmedEntries.split(',').forEach(entry => {
      const parts = entry.split(':').map(s => s.trim());
      if (parts.length === 2) {
        const userId = parseInt(parts[0]);
        const amount = parseFloat(parts[1]);
        if (!isNaN(userId) && !isNaN(amount) && amount > 0) {
          result[userId] = amount;
        }
      }
    });
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'groupId' ? (value ? parseFloat(value) : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Parse the user:amount entries
      const paidBy = parseUserAmountEntries(formData.paidByEntries);
      const owedBy = parseUserAmountEntries(formData.owedByEntries);

      // Validation
      if (Object.keys(paidBy).length === 0) {
        setError('Please enter at least one "Paid By" entry');
        setLoading(false);
        return;
      }

      if (Object.keys(owedBy).length === 0) {
        setError('Please enter at least one "Owed By" entry');
        setLoading(false);
        return;
      }

      // Calculate totals
      const totalPaid = Object.values(paidBy).reduce((sum, amount) => sum + amount, 0);
      const totalOwed = Object.values(owedBy).reduce((sum, amount) => sum + amount, 0);

      // Validate that totals match the expense amount
      if (Math.abs(totalPaid - formData.amount) > 0.01) {
        setError(`Total paid (${totalPaid.toFixed(2)}) must equal the expense amount (${formData.amount.toFixed(2)})`);
        setLoading(false);
        return;
      }

      if (Math.abs(totalOwed - formData.amount) > 0.01) {
        setError(`Total owed (${totalOwed.toFixed(2)}) must equal the expense amount (${formData.amount.toFixed(2)})`);
        setLoading(false);
        return;
      }

      if (Math.abs(totalPaid - totalOwed) > 0.01) {
        setError(`Total paid (${totalPaid.toFixed(2)}) and total owed (${totalOwed.toFixed(2)}) must be equal`);
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

      console.log('Sending request:', request); // Debug log

      const response = await expenseService.createExpense(request);
      setSuccess(`Expense "${response.expenseName}" created successfully in group "${response.groupName}"!`);

      // Reset form
      setFormData({
        name: '',
        amount: 0,
        groupId: 0,
        paidByEntries: '',
        owedByEntries: ''
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Create expense error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('Group or User not found. Please check IDs.');
      } else if (error.response?.status === 400) {
        setError('Invalid request. Please check your input.');
      } else {
        setError('Failed to create expense. Please check your input and try again.');
      }
    } finally {
      setLoading(false);
    }
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
              placeholder="e.g., Dinner, Rent, Fuel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Total Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
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
              placeholder="e.g., 1:15000 or 1:7500, 2:7500"
              required
            />
            <small className="form-hint">Format: userId:amount, separated by commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="owedByEntries">Owed By (userId:amount):</label>
            <input
              type="text"
              id="owedByEntries"
              name="owedByEntries"
              value={formData.owedByEntries}
              onChange={handleInputChange}
              placeholder="e.g., 1:6000, 2:4000, 3:5000"
              required
            />
            <small className="form-hint">Format: userId:amount, separated by commas</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>

        <div className="info-box">
          <h4>💡 How to fill this form:</h4>
          <ul>
            <li><strong>Expense Name:</strong> A descriptive name for the expense</li>
            <li><strong>Total Amount:</strong> The total cost of the expense</li>
            <li><strong>Group ID:</strong> The ID of the group this expense belongs to</li>
            <li><strong>Paid By:</strong> Who paid and how much (e.g., "1:15000" means user 1 paid 15000)</li>
            <li><strong>Owed By:</strong> Who owes and how much (e.g., "1:6000, 2:4000, 3:5000")</li>
          </ul>
          <p><strong>Note:</strong> Total paid must equal total owed and both must equal the expense amount.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateExpense;
