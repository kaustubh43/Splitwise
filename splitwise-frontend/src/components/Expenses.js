import React, { useState, useEffect } from 'react';
import { expenseService, groupService, userService } from '../services/apiService';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        groupId: '',
        paidBy: {},
        owedBy: {}
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expensesResponse, groupsResponse, usersResponse] = await Promise.all([
                expenseService.getAllExpenses(),
                groupService.getAllGroups(),
                userService.getAllUsers()
            ]);
            setExpenses(expensesResponse.data);
            setGroups(groupsResponse.data);
            setUsers(usersResponse.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Expenses error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            // Convert string amounts to numbers and filter out zero amounts
            const paidBy = Object.fromEntries(
                Object.entries(newExpense.paidBy)
                    .filter(([_, amount]) => parseFloat(amount) > 0)
                    .map(([userId, amount]) => [parseInt(userId), parseFloat(amount)])
            );

            const owedBy = Object.fromEntries(
                Object.entries(newExpense.owedBy)
                    .filter(([_, amount]) => parseFloat(amount) > 0)
                    .map(([userId, amount]) => [parseInt(userId), parseFloat(amount)])
            );

            const expenseData = {
                name: newExpense.name,
                amount: parseFloat(newExpense.amount),
                groupId: parseInt(newExpense.groupId),
                paidBy,
                owedBy
            };

            await expenseService.createExpense(expenseData);
            setNewExpense({ name: '', amount: '', groupId: '', paidBy: {}, owedBy: {} });
            setShowCreateForm(false);
            fetchData();
        } catch (err) {
            setError('Failed to create expense');
            console.error('Create expense error:', err);
        }
    };

    const handleViewExpense = async (expenseId) => {
        try {
            const response = await expenseService.getExpenseById(expenseId);
            setSelectedExpense(response.data);
            setShowViewModal(true);
        } catch (err) {
            setError('Failed to fetch expense details');
            console.error('View expense error:', err);
        }
    };

    const getGroupUsers = () => {
        const selectedGroup = groups.find(g => g.groupId === parseInt(newExpense.groupId));
        if (!selectedGroup) return [];

        return users.filter(user => selectedGroup.members.includes(user.name));
    };

    const handleAmountChange = (userId, amount, type) => {
        setNewExpense(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [userId]: amount
            }
        }));
    };

    const splitEqually = () => {
        const groupUsers = getGroupUsers();
        const totalAmount = parseFloat(newExpense.amount) || 0;
        const amountPerPerson = totalAmount / groupUsers.length;

        const equalSplit = {};
        groupUsers.forEach(user => {
            equalSplit[user.id] = amountPerPerson.toFixed(2);
        });

        setNewExpense(prev => ({
            ...prev,
            owedBy: equalSplit
        }));
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
                <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Expense
                </button>
            </div>

            {/* Expenses List */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">All Expenses</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-medium text-gray-900">{expense.name}</h3>
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ${expense.amount?.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Group: {expense.group?.name}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewExpense(expense.id)}
                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {expenses.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new expense.</p>
                </div>
            )}

            {/* Create Expense Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Expense</h3>
                            <form onSubmit={handleCreateExpense} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Expense Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newExpense.name}
                                            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter expense name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Group</label>
                                    <select
                                        required
                                        value={newExpense.groupId}
                                        onChange={(e) => setNewExpense({ ...newExpense, groupId: e.target.value, paidBy: {}, owedBy: {} })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a group</option>
                                        {groups.map((group) => (
                                            <option key={group.groupId} value={group.groupId}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {newExpense.groupId && (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium text-gray-700">Who Paid?</label>
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                                                {getGroupUsers().map((user) => (
                                                    <div key={user.id} className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{user.name}</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={newExpense.paidBy[user.id] || ''}
                                                            onChange={(e) => handleAmountChange(user.id, e.target.value, 'paidBy')}
                                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium text-gray-700">Who Owes?</label>
                                                <button
                                                    type="button"
                                                    onClick={splitEqually}
                                                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                                >
                                                    Split Equally
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                                                {getGroupUsers().map((user) => (
                                                    <div key={user.id} className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{user.name}</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={newExpense.owedBy[user.id] || ''}
                                                            onChange={(e) => handleAmountChange(user.id, e.target.value, 'owedBy')}
                                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

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
                                        Add Expense
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Expense Modal */}
            {showViewModal && selectedExpense && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedExpense.name}</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Total Amount</p>
                                    <p className="text-2xl font-bold text-green-600">${selectedExpense.amount?.toFixed(2)}</p>
                                </div>

                                {selectedExpense.paidBy && Object.keys(selectedExpense.paidBy).length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Paid By</p>
                                        <div className="space-y-1">
                                            {Object.entries(selectedExpense.paidBy).map(([name, amount]) => (
                                                <div key={name} className="flex justify-between text-sm">
                                                    <span>{name}</span>
                                                    <span className="font-medium">${amount?.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedExpense.owedBy && Object.keys(selectedExpense.owedBy).length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Owed By</p>
                                        <div className="space-y-1">
                                            {Object.entries(selectedExpense.owedBy).map(([name, amount]) => (
                                                <div key={name} className="flex justify-between text-sm">
                                                    <span>{name}</span>
                                                    <span className="font-medium">${amount?.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;