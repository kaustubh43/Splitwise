import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService, userService } from '../services/api';
import { GroupResponse, GroupAddUsersRequest, User } from '../types';
import './CreateExpense.css'; // Reuse the same form styling

const AddUsersToGroup: React.FC = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [allGroups, allUsers] = await Promise.all([
        groupService.getAllGroups(),
        userService.getAllUsers()
      ]);
      setGroups(allGroups);
      setUsers(allUsers);
      if (allGroups.length > 0) {
        setSelectedGroupId(allGroups[0].groupId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedGroupId === 0) {
        setError('Please select a group');
        setLoading(false);
        return;
      }

      if (selectedUserIds.length === 0) {
        setError('Please select at least one user to add');
        setLoading(false);
        return;
      }

      const request: GroupAddUsersRequest = {
        groupId: selectedGroupId,
        userIds: selectedUserIds.map(id => id.toString())
      };

      const result = await groupService.addUsersToGroup(request);

      if (result) {
        const selectedGroup = groups.find(g => g.groupId === selectedGroupId);
        const addedUsers = users.filter(u => selectedUserIds.includes(u.id)).map(u => u.name);
        setSuccess(`Successfully added ${addedUsers.join(', ')} to group "${selectedGroup?.name}"!`);
        setSelectedUserIds([]);

        // Refresh groups to show updated members
        setTimeout(() => {
          fetchData();
        }, 500);

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Failed to add users to group');
      }
    } catch (error: any) {
      console.error('Add users error:', error);
      if (error.response?.status === 404) {
        setError('Group or User not found.');
      } else if (error.response?.status === 409) {
        setError('One or more users are already in the group.');
      } else {
        setError('Failed to add users to group. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="form-container">
        <div className="form-wrapper">
          <div className="loading">Loading groups and users...</div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="form-container">
        <div className="form-wrapper">
          <h2>Add Users to Group</h2>
          <div className="error-message">
            No groups available. Please create a group first.
          </div>
          <div className="form-actions">
            <button onClick={() => navigate('/create-group')}>
              Create Group
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="form-container">
        <div className="form-wrapper">
          <h2>Add Users to Group</h2>
          <div className="error-message">
            No users available in the system.
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedGroup = groups.find(g => g.groupId === selectedGroupId);

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Add Users to Group</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupId">Select Group:</label>
            <select
              id="groupId"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(parseInt(e.target.value))}
              required
            >
              {groups.map(group => (
                <option key={group.groupId} value={group.groupId}>
                  {group.name} (ID: {group.groupId})
                </option>
              ))}
            </select>
          </div>

          {selectedGroup && (
            <div className="info-box" style={{ marginTop: '15px', marginBottom: '15px' }}>
              <h4>📋 Current Members:</h4>
              <ul>
                {selectedGroup.members.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-group">
            <label>Select Users to Add:</label>
            <div style={{ marginBottom: '10px' }}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6c757d'
                }}
              >
                {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
              </button>
              <span style={{ marginLeft: '10px', color: '#666' }}>
                {selectedUserIds.length} user(s) selected
              </span>
            </div>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '2px solid #ddd',
              borderRadius: '6px',
              padding: '10px',
              backgroundColor: '#ffffff'
            }}>
              {users.map(user => (
                <div
                  key={user.id}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor: selectedUserIds.includes(user.id) ? '#e7f3ff' : '#f8f9fa',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: selectedUserIds.includes(user.id) ? '2px solid #007bff' : '1px solid #e0e0e0',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleUserSelection(user.id)}
                >
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                      style={{ marginRight: '10px', cursor: 'pointer' }}
                    />
                    <div>
                      <strong>{user.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading || selectedUserIds.length === 0}>
              {loading ? 'Adding Users...' : `Add ${selectedUserIds.length} User(s)`}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>

        <div className="info-box">
          <h4>💡 How to use this form:</h4>
          <ul>
            <li><strong>Select Group:</strong> Choose the group you want to add users to</li>
            <li><strong>Current Members:</strong> Shows who is already in the selected group</li>
            <li><strong>Select Users:</strong> Click on users to select/deselect them, or use "Select All"</li>
            <li><strong>Visual Feedback:</strong> Selected users are highlighted in blue</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddUsersToGroup;

