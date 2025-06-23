import React, { useState, useEffect } from 'react';
import { groupService, userService } from '../services/apiService';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showAddUsersForm, setShowAddUsersForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroup, setNewGroup] = useState({
        name: '',
        userIds: []
    });
    const [addUsersData, setAddUsersData] = useState({
        groupId: null,
        userIds: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupsResponse, usersResponse] = await Promise.all([
                groupService.getAllGroups(),
                userService.getAllUsers()
            ]);
            setGroups(groupsResponse.data);
            setUsers(usersResponse.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Groups error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await groupService.createGroup(newGroup);
            setNewGroup({ name: '', userIds: [] });
            setShowCreateForm(false);
            fetchData();
        } catch (err) {
            setError('Failed to create group');
            console.error('Create group error:', err);
        }
    };

    const handleAddUsers = async (e) => {
        e.preventDefault();
        try {
            await groupService.addUserToGroup(addUsersData.groupId, addUsersData.userIds);
            setAddUsersData({ groupId: null, userIds: [] });
            setShowAddUsersForm(false);
            fetchData();
        } catch (err) {
            setError('Failed to add users to group');
            console.error('Add users error:', err);
        }
    };

    const handleUserSelection = (userId, isCreating = true) => {
        if (isCreating) {
            setNewGroup(prev => ({
                ...prev,
                userIds: prev.userIds.includes(userId)
                    ? prev.userIds.filter(id => id !== userId)
                    : [...prev.userIds, userId]
            }));
        } else {
            setAddUsersData(prev => ({
                ...prev,
                userIds: prev.userIds.includes(userId)
                    ? prev.userIds.filter(id => id !== userId)
                    : [...prev.userIds, userId]
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Group
                </button>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <div key={group.groupId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
                            <button
                                onClick={() => {
                                    setSelectedGroup(group);
                                    setAddUsersData({ groupId: group.groupId, userIds: [] });
                                    setShowAddUsersForm(true);
                                }}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Members ({group.members?.length || 0}):</p>
                            <div className="flex flex-wrap gap-2">
                                {group.members?.map((member, index) => (
                                    <span
                                        key={index}
                                        className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700"
                                    >
                                        {member}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {groups.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new group.</p>
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter group name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                                        {users.map((user) => (
                                            <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newGroup.userIds.includes(user.id)}
                                                    onChange={() => handleUserSelection(user.id, true)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                    >
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Users Modal */}
            {showAddUsersForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Add Users to {selectedGroup?.name}
                            </h3>
                            <form onSubmit={handleAddUsers} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Users to Add</label>
                                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                                        {users.filter(user => !selectedGroup?.members?.includes(user.name)).map((user) => (
                                            <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={addUsersData.userIds.includes(user.id)}
                                                    onChange={() => handleUserSelection(user.id, false)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUsersForm(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                    >
                                        Add Users
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;