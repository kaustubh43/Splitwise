import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to Splitwise, {userEmail}!</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="action-cards">
          <div className="action-card">
            <h3>Groups</h3>
            <p>Create and manage your expense groups</p>
            <Link to="/create-group" className="action-btn">Create New Group</Link>
          </div>

          <div className="action-card">
            <h3>Expenses</h3>
            <p>Add and track your shared expenses</p>
            <Link to="/create-expense" className="action-btn">Add New Expense</Link>
          </div>

          <div className="action-card">
            <h3>View Expenses</h3>
            <p>View details of existing expenses</p>
            <Link to="/view-expense" className="action-btn">View Expense</Link>
          </div>

          <div className="action-card">
            <h3>Settle Up</h3>
            <p>See who owes what and settle group expenses</p>
            <Link to="/settle-group" className="action-btn">Settle Group</Link>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <p>Use the cards above to start managing your shared expenses with friends and family.</p>
            <ul>
              <li>Create groups for different occasions (trips, roommates, etc.)</li>
              <li>Add expenses and split them among group members</li>
              <li>View settlement details to see who owes what</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
