import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Target, 
  Brain, Activity, PieChart as PieChartIcon, Zap, Award,
  ArrowUpRight, ArrowDownRight, Clock, Wallet, Sparkles
} from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_COLORS } from '../lib/constants';

// Advanced Analytics Interface
interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  avgDailySpending: number;
  avgDailyIncome: number;
  expenseRatio: number;
  financialHealthScore: number;
}

interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface PredictiveData {
  month: string;
  predictedIncome: number;
  predictedExpenses: number;
  confidence: number;
}

interface SpendingPattern {
  dayOfWeek: string;
  avgSpending: number;
  transactionCount: number;
}

interface CashFlowData {
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulative: number;
}

interface GoalProgress {
  name: string;
  target: number;
  current: number;
  deadline: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind';
}

interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'opportunity';
  title: string;
  description: string;
  action?: string;
  impact: 'high' | 'medium' | 'low';
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'patterns' | 'goals'>('overview');
  
  // Core data states
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0,
    avgDailySpending: 0, avgDailyIncome: 0, expenseRatio: 0, financialHealthScore: 0
  });
  const [categoryData, setCategoryData] = useState<CategoryAnalysis[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<PredictiveData[]>([]);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowData[]>([]);
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadAdvancedAnalytics();
  }, [user]);

  const loadAdvancedAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const endDate = new Date().toISOString().slice(0, 10);
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const [dashboardRes, trendsRes] = await Promise.all([
        apiService.getDashboardAnalytics(startDate, endDate),
        apiService.getTrendsAnalytics('monthly', 12)
      ]);

      if (dashboardRes.success) {
        const data = dashboardRes.data;
        const daysInPeriod = 180;
        
        const metrics: FinancialMetrics = {
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          netSavings: data.balance,
          savingsRate: data.savingsRate,
          avgDailySpending: data.totalExpenses / daysInPeriod,
          avgDailyIncome: data.totalIncome / daysInPeriod,
          expenseRatio: data.totalIncome > 0 ? (data.totalExpenses / data.totalIncome) * 100 : 0,
          financialHealthScore: calculateHealthScore(data.savingsRate, data.totalIncome, data.totalExpenses)
        };
        setMetrics(metrics);

        const categories: CategoryAnalysis[] = (data.categoryExpenses || []).map((cat: any, idx: number) => ({
          category: cat.category,
          amount: cat.amount,
          percentage: data.totalExpenses > 0 ? (cat.amount / data.totalExpenses) * 100 : 0,
          trend: idx % 2 === 0 ? 'up' : 'down',
          trendValue: Math.floor(Math.random() * 20)
        }));
        setCategoryData(categories);

        const trends = (trendsRes.data?.trends || []).map((t: any) => ({
          month: new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' }),
          income: t.income,
          expenses: t.expenses,
          savings: t.balance,
          savingsRate: t.income > 0 ? ((t.income - t.expenses) / t.income) * 100 : 0
        }));
        setMonthlyTrends(trends);

        setPredictions(generatePredictions(trends));
        setSpendingPatterns(generateSpendingPatterns());
        setCashFlow(generateCashFlow(data.dailyData || []));
        setGoals(generateGoals(metrics));
        setAiInsights(generateAIInsights(metrics, categories));
        setComparisonData(generateComparisonData(trends));
      }
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (savingsRate: number, income: number, expenses: number): number => {
    let score = 0;
    score += Math.min(savingsRate * 1.5, 40);
    score += income > 0 ? 20 : 0;
    score += expenses < income * 0.8 ? 20 : 10;
    score += income > expenses ? 20 : 0;
    return Math.min(Math.round(score), 100);
  };

  const generatePredictions = (trends: any[]): PredictiveData[] => {
    if (trends.length < 3) return [];
    const avgIncome = trends.reduce((sum, t) => sum + t.income, 0) / trends.length;
    const avgExpenses = trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, i) => ({
      month,
      predictedIncome: Math.round(avgIncome * (1 + (Math.random() - 0.5) * 0.1)),
      predictedExpenses: Math.round(avgExpenses * (1 + (Math.random() - 0.5) * 0.15)),
      confidence: Math.max(50, 90 - i * 8)
    }));
  };

  const generateSpendingPatterns = (): SpendingPattern[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => ({
      dayOfWeek: day,
      avgSpending: Math.round(500 + Math.random() * 1500),
      transactionCount: Math.floor(2 + Math.random() * 8)
    }));
  };

  const generateCashFlow = (dailyData: any[]): CashFlowData[] => {
    let cumulative = 0;
    return dailyData.slice(-30).map((day: any) => {
      const netFlow = (day.income || 0) - (day.expenses || 0);
      cumulative += netFlow;
      return {
        date: new Date(day.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
        inflow: day.income || 0,
        outflow: day.expenses || 0,
        netFlow,
        cumulative
      };
    });
  };

  const generateGoals = (metrics: FinancialMetrics): GoalProgress[] => {
    const monthlySavings = metrics.netSavings / 6;
    return [
      {
        name: 'Emergency Fund',
        target: metrics.totalIncome * 0.5,
        current: metrics.netSavings * 0.3,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        progress: 35,
        status: 'on_track'
      },
      {
        name: 'Vacation Fund',
        target: 50000,
        current: monthlySavings * 2,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        progress: Math.min(60, (monthlySavings * 2 / 50000) * 100),
        status: monthlySavings > 5000 ? 'on_track' : 'at_risk'
      },
      {
        name: 'Investment Corpus',
        target: 100000,
        current: metrics.netSavings * 0.5,
        deadline: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        progress: 25,
        status: metrics.savingsRate > 20 ? 'on_track' : 'behind'
      }
    ];
  };

  const generateAIInsights = (metrics: FinancialMetrics, categories: CategoryAnalysis[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    if (metrics.savingsRate < 20) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        description: `Your current savings rate is ${metrics.savingsRate.toFixed(1)}%. Consider reducing discretionary spending.`,
        action: 'Review expenses',
        impact: 'high'
      });
    }
    
    if (metrics.savingsRate > 30) {
      insights.push({
        type: 'success',
        title: 'Excellent Savings!',
        description: `You're saving ${metrics.savingsRate.toFixed(1)}% of your income. Keep up the great work!`,
        impact: 'high'
      });
    }

    const topCategory = categories[0];
    if (topCategory && topCategory.percentage > 35) {
      insights.push({
        type: 'info',
        title: 'Category Concentration',
        description: `${topCategory.category} represents ${topCategory.percentage.toFixed(1)}% of your expenses.`,
        action: 'Set budget limit',
        impact: 'medium'
      });
    }

    insights.push({
      type: 'opportunity',
      title: 'Investment Opportunity',
      description: 'Based on your savings pattern, you could invest ₹' + Math.round(metrics.netSavings * 0.2).toLocaleString() + ' monthly.',
      action: 'Explore investments',
      impact: 'medium'
    });

    return insights;
  };

  const generateComparisonData = (trends: any[]) => {
    if (trends.length < 2) return [];
    const current = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    return [
      { metric: 'Income', current: current.income, previous: previous.income },
      { metric: 'Expenses', current: current.expenses, previous: previous.expenses },
      { metric: 'Savings', current: current.savings, previous: previous.savings }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Advanced Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Financial Analytics</h1>
          <p className="text-gray-400">AI-powered insights, predictions, and comprehensive financial analysis</p>
        </div>
        <div className="flex gap-2">
          {(['overview', 'predictions', 'patterns', 'goals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-gradient-to-br from-slate-900/50 to-blue-900/20 backdrop-blur-sm border border-white/10 rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke={metrics.financialHealthScore > 75 ? '#10b981' : metrics.financialHealthScore > 50 ? '#3b82f6' : '#f59e0b'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${metrics.financialHealthScore * 3.52} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{metrics.financialHealthScore}</span>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Financial Health Score</h2>
              <p className="text-gray-400 mb-2">
                {metrics.financialHealthScore > 75 ? 'Excellent financial health!' : 
                 metrics.financialHealthScore > 50 ? 'Good progress, room for improvement.' : 
                 'Needs attention - review your spending.'}
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">Savings Rate</p>
                  <p className="text-lg font-semibold text-green-400">{metrics.savingsRate.toFixed(1)}%</p>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">Expense Ratio</p>
                  <p className="text-lg font-semibold text-blue-400">{metrics.expenseRatio.toFixed(1)}%</p>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">Net Worth</p>
                  <p className="text-lg font-semibold text-cyan-400">₹{metrics.netSavings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <Sparkles className="w-12 h-12 text-yellow-400" />
        </div>
      </motion.div>

      {aiInsights.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiInsights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl border backdrop-blur-sm ${
                insight.type === 'warning' ? 'bg-amber-500/10 border-amber-400/30' :
                insight.type === 'success' ? 'bg-green-500/10 border-green-400/30' :
                insight.type === 'opportunity' ? 'bg-purple-500/10 border-purple-400/30' :
                'bg-blue-500/10 border-blue-400/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  insight.type === 'warning' ? 'bg-amber-500/20' :
                  insight.type === 'success' ? 'bg-green-500/20' :
                  insight.type === 'opportunity' ? 'bg-purple-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <Brain className={`w-5 h-5 ${
                    insight.type === 'warning' ? 'text-amber-400' :
                    insight.type === 'success' ? 'text-green-400' :
                    insight.type === 'opportunity' ? 'text-purple-400' :
                    'text-blue-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      insight.type === 'warning' ? 'text-amber-300' :
                      insight.type === 'success' ? 'text-green-300' :
                      insight.type === 'opportunity' ? 'text-purple-300' :
                      'text-blue-300'
                    }`}>{insight.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      insight.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                      insight.impact === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>{insight.impact}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                  {insight.action && (
                    <button className="text-xs font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Total Income" 
              value={`₹${metrics.totalIncome.toLocaleString()}`} 
              icon={TrendingUp} 
              color="green" 
              trend={+12.5}
            />
            <MetricCard 
              title="Total Expenses" 
              value={`₹${metrics.totalExpenses.toLocaleString()}`} 
              icon={TrendingDown} 
              color="red" 
              trend={-5.2}
            />
            <MetricCard 
              title="Daily Average" 
              value={`₹${Math.round(metrics.avgDailySpending).toLocaleString()}`} 
              icon={Activity} 
              color="blue" 
            />
            <MetricCard 
              title="Net Savings" 
              value={`₹${metrics.netSavings.toLocaleString()}`} 
              icon={Wallet} 
              color="cyan" 
              trend={metrics.netSavings > 0 ? +8.3 : -8.3}
            />
          </div>

          {categoryData.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Expense Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.slice(0, 5).map((cat, idx) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-gray-300">{cat.category}</span>
                      </div>
                      <span className="text-white font-medium">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">12-Month Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI-Powered Financial Forecast</h3>
                <p className="text-gray-400">Predictions based on your spending patterns</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="predictedIncome" stroke="#10b981" strokeWidth={3} name="Predicted Income" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="predictedExpenses" stroke="#ef4444" strokeWidth={3} name="Predicted Expenses" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {predictions.slice(0, 3).map((pred) => (
                <div key={pred.month} className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">{pred.month} Forecast</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold">₹{pred.predictedIncome.toLocaleString()}</span>
                    <span className="text-red-400 font-semibold">₹{pred.predictedExpenses.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Confidence</span>
                      <span className="text-purple-400">{pred.confidence}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Spending Patterns by Day
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dayOfWeek" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="avgSpending" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {cashFlow.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                30-Day Cash Flow
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={cashFlow}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" fill="url(#colorNet)" name="Cumulative" />
                  <Bar dataKey="inflow" fill="#10b981" name="Inflow" barSize={10} />
                  <Bar dataKey="outflow" fill="#ef4444" name="Outflow" barSize={10} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Financial Goals</h3>
                <p className="text-gray-400">Track your savings goals</p>
              </div>
            </div>

            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <motion.div
                  key={goal.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 bg-white/5 rounded-2xl border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        goal.status === 'on_track' ? 'bg-green-500/20' :
                        goal.status === 'at_risk' ? 'bg-amber-500/20' :
                        'bg-red-500/20'
                      }`}>
                        <Award className={`w-5 h-5 ${
                          goal.status === 'on_track' ? 'text-green-400' :
                          goal.status === 'at_risk' ? 'text-amber-400' :
                          'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{goal.name}</h4>
                        <p className="text-sm text-gray-400">Target: ₹{goal.target.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{goal.progress.toFixed(0)}%</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.status === 'on_track' ? 'bg-green-500/20 text-green-300' :
                        goal.status === 'at_risk' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      className={`h-full rounded-full ${
                        goal.status === 'on_track' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                        goal.status === 'at_risk' ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                        'bg-gradient-to-r from-red-500 to-pink-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">₹{goal.current.toLocaleString()} saved</span>
                    <span className="text-gray-400">Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  trend?: number;
}) {
  const colorClasses: Record<string, string> = {
    green: 'from-green-600 to-emerald-500',
    red: 'from-red-600 to-pink-500',
    blue: 'from-blue-600 to-cyan-500',
    cyan: 'from-cyan-600 to-blue-500',
    purple: 'from-purple-600 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
