import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, TrendingUp, Trash2, Calendar } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { INCOME_SOURCES } from '../lib/constants';

interface Income {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function Income() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    amount: string;
    source: typeof INCOME_SOURCES[number];
    description: string;
    date: string;
  }>({
    amount: '',
    source: INCOME_SOURCES[0],
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadIncomes();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const loadIncomes = async () => {
    if (!user) {
      console.log('No user found, skipping income load');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading incomes for user:', user.id);
      const response = await apiService.getTransactions({ type: 'income' });
      console.log('Income response:', response);
      setIncomes(response.data.transactions || []);
    } catch (error) {
      console.error('Error loading incomes:', error);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login first');
      return;
    }

    // Validate form data
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    const transactionData = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.source,
      type: 'income' as const,
      date: formData.date || new Date().toISOString().slice(0, 10),
    };

    console.log('Submitting transaction data:', transactionData);

    setSubmitting(true);
    try {
      const response = await apiService.createTransaction(transactionData);
      console.log('Transaction response:', response);

      if (response.success) {
        // Success - reset form and close
        setFormData({
          amount: '',
          source: INCOME_SOURCES[0] as typeof INCOME_SOURCES[number],
          description: '',
          date: new Date().toISOString().slice(0, 10),
        });
        setShowForm(false);
        
        // Reload incomes to show new data
        await loadIncomes();
        
        alert('Income added successfully!');
      } else {
        // API returned error
        console.error('API Error:', response.message);
        alert('Error: ' + (response.message || 'Failed to add income'));
      }
    } catch (error: any) {
      console.error('Error adding income:', error);
      alert('Error adding income: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      loadIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const monthlyData = incomes.reduce((acc, income) => {
    const month = income.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + Number(income.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-6)
    .reverse();

  const sourceData = incomes.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + Number(income.amount);
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Income Tracking</h1>
          <p className="text-gray-400">Manage and analyze your income sources</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Income
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">New Income Entry</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as typeof INCOME_SOURCES[number] })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {INCOME_SOURCES.map((source) => (
                  <option key={source} value={source} className="bg-slate-900">
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Optional notes"
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  'Add Income'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Monthly Income Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No income data yet
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Income by Source</h3>
          <div className="space-y-4">
            {Object.entries(sourceData).map(([source, amount]) => {
              const total = Object.values(sourceData).reduce((sum, val) => sum + val, 0);
              const percentage = ((amount / total) * 100).toFixed(1);
              return (
                <div key={source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">{source}</span>
                    <span className="text-white font-semibold">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-emerald-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{percentage}%</span>
                </div>
              );
            })}
            {Object.keys(sourceData).length === 0 && (
              <div className="text-center py-8 text-gray-400">No income sources yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Income History</h3>
        {incomes.length > 0 ? (
          <div className="space-y-3">
            {incomes.map((income) => (
              <motion.div
                key={income.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{income.category}</p>
                    <p className="text-sm text-gray-400">{income.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-green-400">+₹{Number(income.amount).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {income.date}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No income entries yet</div>
        )}
      </div>
    </div>
  );
}
