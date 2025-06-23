import React, { useState, useEffect } from 'react';
import { transactionService, groupService } from '../services/apiService';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [settlementTransactions, setSettlementTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSettlement, setShowSettlement] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            fetchTransactionsByGroup(selectedGroupId);
        }
    }, [selectedGroupId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transactionsResponse, groupsResponse] = await Promise.all([
                transactionService.getAllTransactions(),
                groupService.getAllGroups()
            ]);
            setTransactions(transactionsResponse.data);
            setGroups(groupsResponse.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Transactions error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionsByGroup = async (groupId) => {
        try {
            const response = await transactionService.getTransactionsByGroup(groupId);
            setTransactions(response.data);
        } catch (err) {
            setError('Failed to fetch group transactions');
            console.error('Group transactions error:', err);
        }
    };

    const handleSettleUp = async (groupId) => {
        try {
            setLoading(true);
            // Note: Based on your backend API, this endpoint might be different
            // Using the groups controller settle up endpoint
            const response = await fetch(`http://localhost:8080/groups/${groupId}/settleup`);
            if (!response.ok) throw new Error('Failed to fetch settlement');

            const settlementData = await response.json();
            setSettlementTransactions(settlementData);
            setShowSettlement(true);
        } catch (err) {
            setError('Failed to calculate settlement');
            console.error('Settlement error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettleTransaction = async (transactionId) => {
        try {
            await transactionService.settleTransaction(transactionId);
            fetchData();
        } catch (err) {
            setError('Failed to settle transaction');
            console.error('Settle transaction error:', err);
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
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <div className="flex space-x-3">
                    <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Groups</option>
                        {groups.map((group) => (
                            <option key={group.groupId} value={group.groupId}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    {selectedGroupId && (
                        <button
                            onClick={() => handleSettleUp(selectedGroupId)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Settle Up
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        {selectedGroupId ? `Transactions for ${groups.find(g => g.groupId == selectedGroupId)?.name}` : 'All Transactions'}
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.paidBy?.name || 'Unknown'} → {transaction.paidTo?.name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Amount: ${transaction.amount?.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Status: {transaction.settled ? 'Settled' : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.settled
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {transaction.settled ? 'Settled' : 'Pending'}
                                        </span>
                                        {!transaction.settled && (
                                            <button
                                                onClick={() => handleSettleTransaction(transaction.id)}
                                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                                            >
                                                Settle
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {selectedGroupId ? 'No transactions found for this group.' : 'No transactions found.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Settlement Summary */}
            {selectedGroupId && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">Group Summary</h3>
                            <p className="text-sm text-blue-700">
                                View and manage all transactions for {groups.find(g => g.groupId == selectedGroupId)?.name}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-900 mb-2">Settlement Options</h3>
                            <p className="text-sm text-green-700">
                                Calculate optimal settlement transactions to minimize the number of payments
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Settlement Modal */}
            {showSettlement && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Settlement Plan</h3>

                            {settlementTransactions.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Here's the optimal way to settle all debts with the minimum number of transactions:
                                    </p>
                                    {settlementTransactions.map((settlement, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                                    <span className="font-medium">{settlement.paidBy}</span>
                                                    <span className="mx-2 text-gray-500">→</span>
                                                    <span className="font-medium">{settlement.paidTo}</span>
                                                </div>
                                                <span className="font-bold text-green-600">
                                                    ${settlement.amount?.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                        <p className="text-sm text-blue-700">
                                            💡 This settlement plan minimizes the number of transactions needed to settle all debts.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">All settled up!</h3>
                                    <p className="mt-1 text-sm text-gray-500">No outstanding debts in this group.</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    onClick={() => setShowSettlement(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Close
                                </button>
                                {settlementTransactions.length > 0 && (
                                    <button
                                        onClick={() => {
                                            // Here you would implement marking all as settled
                                            setShowSettlement(false);
                                            fetchData();
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                                    >
                                        Mark All as Settled
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;