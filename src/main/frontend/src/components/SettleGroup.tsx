import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettleGroup: React.FC = () => {
  const [groupId, setGroupId] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!groupId || groupId <= 0) {
      setError('Please enter a valid group ID');
      return;
    }

    // Navigate to the settlement page with the group ID
    navigate(`/settlement/${groupId}`);
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Settle Group Expenses</h2>
        <p>Enter the group ID to see settlement recommendations and find out who owes what.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupId">Group ID:</label>
            <input
              type="number"
              id="groupId"
              value={groupId || ''}
              onChange={(e) => setGroupId(parseInt(e.target.value) || 0)}
              placeholder="Enter group ID"
              required
            />
            <small>Enter the ID of the group you want to settle up</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit">
              View Settlement
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </form>

        <div className="info-section">
          <h3>How Settlement Works</h3>
          <ul>
            <li>Enter your group ID to see who owes money to whom</li>
            <li>The system calculates the optimal way to settle all debts</li>
            <li>You'll see exactly who should pay whom and how much</li>
            <li>This minimizes the number of transactions needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettleGroup;
