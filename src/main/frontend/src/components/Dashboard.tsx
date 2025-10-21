import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
      return;
    }
    setUserEmail(email);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleViewExpenses = () => {
    if (groupId.trim()) {
      navigate(`/view-expenses/${groupId}`);
    } else {
      alert('Please enter a Group ID');
    }
  };

  const handleSettlement = () => {
    if (groupId.trim()) {
      navigate(`/settlement/${groupId}`);
    } else {
      alert('Please enter a Group ID');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Splitwise Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="actions-section">
          <h2>Quick Actions</h2>

          <div className="action-group">
            <button onClick={() => navigate('/create-group')} className="action-btn">
              Create New Group
            </button>
            <p className="action-description">Start a new group to split expenses with friends</p>
          </div>

          <div className="action-group">
            <button onClick={() => navigate('/add-users-to-group')} className="action-btn">
              Add Users to Group
            </button>
            <p className="action-description">Add new members to an existing group</p>
          </div>

          <div className="action-group">
            <button onClick={() => navigate('/create-expense')} className="action-btn">
              Create New Expense
            </button>
            <p className="action-description">Add an expense to an existing group</p>
          </div>

          <div className="action-group">
            <button onClick={() => navigate('/settle-group')} className="action-btn">
              Settle Group
            </button>
            <p className="action-description">View and settle balances for a group</p>
          </div>
        </div>

        <div className="group-actions-section">
          <h2>Group Operations</h2>
          <p>Enter a Group ID to perform operations:</p>

          <div className="group-input-section">
            <input
              type="number"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Enter Group ID"
              className="group-id-input"
            />
          </div>

          <div className="group-buttons">
            <button
              onClick={handleViewExpenses}
              className="group-action-btn view-expenses-btn"
              disabled={!groupId.trim()}
            >
              📋 View All Expenses
            </button>

            <button
              onClick={handleSettlement}
              className="group-action-btn settlement-btn"
              disabled={!groupId.trim()}
            >
              💰 View Settlement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
