import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService } from '../services/api';
import { SettlementTransaction } from '../types';

const Settlement: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [settlements, setSettlements] = useState<SettlementTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const fetchSettlements = async () => {
    if (!groupId) return;

    setLoading(true);
    setError('');

    try {
      const response = await groupService.settleUp(parseInt(groupId));
      setSettlements(response);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Group not found');
      } else {
        setError('Failed to fetch settlement details');
      }
      console.error('Settlement error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [groupId]);

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading">Loading settlement details...</div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Settlement Details for Group {groupId}</h2>

        {error && <div className="error-message">{error}</div>}

        {settlements.length === 0 && !error && !loading ? (
          <div className="no-settlements">
            <p>No settlements needed for this group. Everyone is settled up!</p>
          </div>
        ) : (
          <div className="settlements-list">
            <h3>Recommended Transactions:</h3>
            {settlements.map((settlement, index) => (
              <div key={index} className="settlement-item">
                <div className="settlement-details">
                  <span className="payer">{settlement.paidBy}</span>
                  <span className="arrow">→</span>
                  <span className="receiver">{settlement.paidTo}</span>
                  <span className="amount">${settlement.amount.toFixed(2)}</span>
                </div>
                <p className="settlement-description">
                  {settlement.paidBy} owes {settlement.paidTo} ${settlement.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button onClick={fetchSettlements} disabled={loading}>
            Refresh Settlements
          </button>
          <button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settlement;
