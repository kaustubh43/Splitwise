import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/api';
import { GroupRequest } from '../types';

const CreateGroup: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [userIds, setUserIds] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Parse user IDs from comma-separated string
      const userIdArray = userIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (userIdArray.length === 0) {
        setError('Please enter at least one valid user ID');
        setLoading(false);
        return;
      }

      const request: GroupRequest = {
        name: groupName,
        userIds: userIdArray  // Now correctly sends string array for Long serialization
      };

      const response = await groupService.createGroup(request);
      setSuccess(`Group "${response.name}" created successfully with members: ${response.members.join(', ')}`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError('Failed to create group. Please check if all user IDs are valid.');
      console.error('Create group error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Group Name:</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Trip to Vegas, Roommate Expenses"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userIds">User IDs (comma separated):</label>
            <input
              type="text"
              id="userIds"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="e.g., 1, 2, 3"
              required
            />
            <small>Enter the user IDs of people you want to add to this group</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Group...' : 'Create Group'}
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

export default CreateGroup;
