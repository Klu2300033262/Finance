import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, TrendingDown, Wallet, PiggyBank, AlertCircle, RefreshCw } from 'lucide-react';
import KPICard from '../components/KPICard';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_COLORS } from '../lib/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savingsRate: 0,
    categoryExpenses: [],
    dailyData: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const startDate = `${currentMonth}-01`;
    const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    try {
      const response = await apiService.getDashboardAnalytics(startDate, endDate);
      
      if (response.success) {
        setData({
          totalIncome: response.data.totalIncome || 0,
          totalExpenses: response.data.totalExpenses || 0,
          balance: response.data.balance || 0,
          savingsRate: response.data.savingsRate || 0,
          categoryExpenses: response.data.categoryExpenses || [],
          dailyData: response.data.dailyData || [],
          recentTransactions: response.data.recentTransactions || [],
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error
      setData({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        savingsRate: 0,
        categoryExpenses: [],
        dailyData: [],
        recentTransactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">Here's your financial overview for this month</p>
          </div>
          <button
            onClick={refreshDashboard}
            disabled={refreshing}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Income"
          value={`₹${data.totalIncome.toLocaleString()}`}
          change={12.5}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-400"
        />
        <KPICard
          title="Total Expenses"
          value={`₹${data.totalExpenses.toLocaleString()}`}
          change={-8.2}
          icon={TrendingDown}
          gradient="from-red-500 to-pink-400"
        />
        <KPICard
          title="Balance"
          value={`₹${data.balance.toLocaleString()}`}
          icon={Wallet}
          gradient="from-blue-500 to-cyan-400"
        />
        <KPICard
          title="Savings Rate"
          value={`${data.savingsRate.toFixed(1)}%`}
          change={5.3}
          icon={PiggyBank}
          gradient="from-purple-500 to-pink-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Cash Flow Trend</h3>
          {data.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.dailyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available yet
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Expenses by Category</h3>
          {data.categoryExpenses.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.categoryExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {data.categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#64748b'} />
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
              <div className="space-y-2 mt-4">
                {data.categoryExpenses.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#64748b' }}
                      ></div>
                      <span className="text-sm text-gray-300">{cat.category}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      ₹{cat.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              No expenses yet
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
          {data.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {data.recentTransactions.map((transaction) => (
                <div
                   key={transaction.id || transaction._id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-400 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{transaction.description || transaction.category}</p>
                      <p className="text-sm text-gray-400">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-400">-₹{Number(transaction.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{transaction.category}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">No transactions yet</div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Smart Insights</h3>
          <div className="space-y-4">
            {data.totalExpenses > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-300 mb-1">Spending Analysis</p>
                    <p className="text-sm text-gray-300">
                      You've spent ₹{data.totalExpenses.toLocaleString()} this month.
                      {data.categoryExpenses.length > 0 &&
                        ` Top category: ${data.categoryExpenses[0].category}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {data.savingsRate > 30 && (
              <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <PiggyBank className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-300 mb-1">Great Savings!</p>
                    <p className="text-sm text-gray-300">
                      You're saving {data.savingsRate.toFixed(1)}% of your income. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {data.savingsRate < 10 && data.totalIncome > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-300 mb-1">Low Savings Alert</p>
                    <p className="text-sm text-gray-300">
                      Your savings rate is {data.savingsRate.toFixed(1)}%. Consider reviewing your expenses.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
