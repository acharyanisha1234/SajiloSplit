import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await axios.get(`/api/wallet/transactions/${id}`);
      setTransaction(response.data.data);
    } catch (error) {
      toast.error('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const getTypeColor = (type) => {
    const colors = {
      deposit: 'text-green-600',
      transfer: 'text-blue-600',
      withdrawal: 'text-red-600',
      group_contribution: 'text-purple-600',
      group_expense: 'text-orange-600',
      settlement: 'text-teal-600'
    };
    return colors[type] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Transaction not found</p>
        <button onClick={() => navigate('/transactions')} className="btn-primary mt-4">
          Back to Transactions
        </button>
      </div>
    );
  }

  const isSender = transaction.sender?._id === user?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-500">{transaction.transactionId}</p>
        </div>
      </div>

      <div className="dashboard-card max-w-2xl mx-auto">
        {/* Amount */}
        <div className="text-center py-6 border-b">
          <p className="text-sm text-gray-500">Amount</p>
          <p className={`text-4xl font-bold mt-2 ${isSender ? 'text-red-600' : 'text-green-600'}`}>
            {isSender ? '-' : '+'}{formatCurrency(transaction.amount)}
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
            transaction.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
          }`}>
            {transaction.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Transaction ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{transaction.transactionId}</span>
              <button onClick={() => handleCopy(transaction.transactionId)}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Type</span>
            <span className={`font-medium ${getTypeColor(transaction.type)}`}>
              {transaction.type}
            </span>
          </div>

          {transaction.sender && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Sender</span>
              <span className="font-medium">{transaction.sender.name}</span>
            </div>
          )}

          {transaction.receiver && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Receiver</span>
              <span className="font-medium">{transaction.receiver.name}</span>
            </div>
          )}

          {transaction.purpose && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Purpose</span>
              <span className="font-medium">{transaction.purpose}</span>
            </div>
          )}

          {transaction.group && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Group</span>
              <Link to={`/groups/${transaction.group._id}`} className="text-primary-600 hover:text-primary-700">
                {transaction.group.name}
              </Link>
            </div>
          )}

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 btn-outline py-2">Download Receipt</button>
          <button className="flex-1 btn-outline py-2">Share</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;