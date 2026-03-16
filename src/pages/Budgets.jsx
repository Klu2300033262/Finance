import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '../lib/constants';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [spending, setSpending] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    month: new Date().toISOString().slice(0, 7),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user]);

  const loadBudgets = async () => {
    if (!user) return;

    try {
      const response = await apiService.getBudgets('monthly');
      const budgetsData = response.data.budgets || [];
      
      setBudgets(budgetsData);
      setSpending(budgetsData.map(budget => ({
        category: budget.category,
        spent: budget.spent || 0,
        budget: budget.amount,
      })));
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
      setSpending([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await apiService.createBudget({
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: 'monthly',
      });

      setFormData({
        amount: '',
        category: EXPENSE_CATEGORIES[0],
        month: new Date().toISOString().slice(0, 7),
      });
      setShowForm(false);
      loadBudgets();
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteBudget(id);
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getStatusColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'text-red-400';
    if (percentage >= 80) return 'text-amber-400';
    return 'text-green-400';
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'from-red-600 to-red-500';
    if (percentage >= 80) return 'from-amber-600 to-amber-500';
    return 'from-green-600 to-green-500';
  };

  const getStatusIcon = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return <AlertTriangle className="w-5 h-5" />;
    if (percentage >= 80) return <AlertTriangle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget Planning</h1>
          <p className="text-gray-400">Set limits and track spending discipline</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Set Budget
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">New Budget</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-slate-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Budget Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-3 flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Set Budget
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

      {spending.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spending.map((item) => {
            const percentage = Math.min((item.spent / item.budget) * 100, 100);
            const remaining = Math.max(item.budget - item.spent, 0);

            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: CATEGORY_COLORS[item.category] + '30' }}
                    >
                      <Target className="w-6 h-6" style={{ color: CATEGORY_COLORS[item.category] }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.category}</h3>
                      <p className="text-xs text-gray-400">Monthly Budget</p>
                    </div>
                  </div>
                  <div className={getStatusColor(item.spent, item.budget)}>
                    {getStatusIcon(item.spent, item.budget)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Spent</span>
                    <span className={`font-semibold ${getStatusColor(item.spent, item.budget)}`}>
                      ₹{item.spent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Budget</span>
                    <span className="font-semibold text-white">₹{item.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Remaining</span>
                    <span className="font-semibold text-blue-400">₹{remaining.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Usage</span>
                    <span className={`text-xs font-semibold ${getStatusColor(item.spent, item.budget)}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${getProgressColor(item.spent, item.budget)}`}
                    ></motion.div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const budget = budgets.find((b) => b.category === item.category);
                    if (budget) handleDelete(budget.id);
                  }}
                  className="mt-4 w-full px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Budget
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Budgets Set</h3>
          <p className="text-gray-400 mb-6">
            Start planning your finances by setting category budgets for this month
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Set Your First Budget
          </button>
        </div>
      )}
    </div>
  );
}
