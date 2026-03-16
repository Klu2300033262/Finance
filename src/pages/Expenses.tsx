import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, TrendingDown, Trash2, Calendar, Filter } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, CATEGORY_COLORS } from '../lib/constants';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  payment_method: string;
  date: string;
}

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [formData, setFormData] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    description: '',
    payment_method: PAYMENT_METHODS[0],
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter((exp) => exp.category === selectedCategory));
    }
  }, [selectedCategory, expenses]);

  const loadExpenses = async () => {
    if (!user) return;

    try {
      const response = await apiService.getTransactions({ type: 'expense' });
      const expenses = response.data.transactions || [];
      setExpenses(expenses);
      setFilteredExpenses(expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
      setFilteredExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await apiService.createTransaction({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: 'expense',
        date: formData.date,
        tags: [formData.payment_method],
      });

      setFormData({
        amount: '',
        category: EXPENSE_CATEGORIES[0],
        description: '',
        payment_method: PAYMENT_METHODS[0],
        date: new Date().toISOString().slice(0, 10),
      });
      setShowForm(false);
      loadExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Expense Tracking</h1>
          <p className="text-gray-400">Monitor and categorize your spending</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">New Expense Entry</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0.00"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-slate-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method} className="bg-slate-900">
                    {method}
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="What was this expense for?"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Add Expense
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">Total Expenses</h3>
          <p className="text-4xl font-bold text-red-400 mb-4">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-sm text-gray-400">{expenses.length} transactions</p>
        </div>

        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Category Breakdown</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${((entry.value / totalExpenses) * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No expense data yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Expense History</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All" className="bg-slate-900">All Categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-slate-900">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: CATEGORY_COLORS[expense.category] + '30' }}
                  >
                    <TrendingDown className="w-6 h-6" style={{ color: CATEGORY_COLORS[expense.category] }} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{expense.category}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{expense.payment_method}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-red-400">-₹{Number(expense.amount).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {expense.date}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {selectedCategory === 'All' ? 'No expense entries yet' : `No expenses in ${selectedCategory}`}
          </div>
        )}
      </div>
    </div>
  );
}
