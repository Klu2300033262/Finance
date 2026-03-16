import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Target, Calendar, TrendingUp, PieChart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SpendWise</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/50 to-slate-900"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-full mb-6">
              <span className="text-blue-300 text-sm font-medium">Premium Finance Intelligence Platform</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Take Control of Every
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"> Rupee </span>
              You Spend
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Visualize your financial life through elegant dashboards, smart analytics, and premium insights.
              Track expenses, plan budgets, and master your money with confidence.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-2"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                View Dashboard Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: BarChart3, label: 'Smart Analytics' },
              { icon: Target, label: 'Budget Tracking' },
              { icon: Calendar, label: 'Recurring Payments' },
              { icon: TrendingUp, label: 'Financial Insights' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <item.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-gray-300 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
              Premium Financial Intelligence
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to understand and control your money through beautiful visualizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-blue-900/30 to-slate-900/30 backdrop-blur-sm border border-white/10 rounded-3xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-6">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Visual Dashboard</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Experience your finances through stunning KPI cards, area charts, donut visualizations,
                and spending heatmaps. Every metric tells a story.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Charts', 'Graphs', 'Heatmaps', 'Trends'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-500/10 border border-blue-400/30 text-blue-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-cyan-900/30 to-slate-900/30 backdrop-blur-sm border border-white/10 rounded-3xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Budgeting</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Set category budgets and watch real-time progress rings show your spending discipline.
                Get alerts before you exceed limits.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Limits', 'Alerts', 'Progress', 'Control'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-purple-900/30 to-slate-900/30 backdrop-blur-sm border border-white/10 rounded-3xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Recurring Tracking</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Never miss a subscription or bill payment. Visual timeline shows upcoming obligations
                with smart due-date reminders.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Timeline', 'Reminders', 'Subscriptions', 'Bills'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-purple-500/10 border border-purple-400/30 text-purple-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-emerald-900/30 to-slate-900/30 backdrop-blur-sm border border-white/10 rounded-3xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Deep Analytics</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Understand spending patterns, compare months, track savings rate, and discover insights
                through advanced financial intelligence.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Patterns', 'Insights', 'Comparison', 'Reports'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-br from-blue-900/30 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Master Your Finances?
            </h2>
            <p className="text-gray-300 text-lg mb-10">
              Join thousands of users who have taken control of their financial future with SpendWise
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
            >
              Start Your Journey Today
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative py-12 bg-slate-900/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SpendWise</span>
            </div>
            <p className="text-gray-400 text-sm">
              Visualize every decision. Plan every month. Master every rupee.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 SpendWise. Premium Finance Intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
