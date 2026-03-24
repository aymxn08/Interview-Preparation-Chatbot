import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Target, CheckCircle, Brain, Play, Award, Zap, Clock, ChevronRight } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, delay, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-card p-6 border-l-4"
        style={{ borderLeftColor: colorClass }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
            </div>
            <div className={`p-4 rounded-2xl bg-slate-50`}>
                <Icon className="w-8 h-8" style={{ color: colorClass }} />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statsRes, historyRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/user/analytics', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8000/api/interview/history', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setStats(statsRes.data);
                setHistory(historyRes.data.history || []);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 mt-20">Loading dashboard...</div>;

    const hasData = stats && stats.total_interviews > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back, <span className="text-gradient">{user?.name}</span>
                    </h1>
                    <p className="text-slate-600 mt-1">Ready to crush your next interview?</p>
                </div>
                <Link to="/setup">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-blue/30 flex items-center gap-2"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Start Practice
                    </motion.button>
                </Link>
            </div>

            {!hasData ? (
                <div className="glass-card p-12 text-center rounded-3xl border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-10 h-10 text-primary-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No data yet</h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        You haven't completed any practice sessions yet. Start practicing to see your analytics and performance trends here.
                    </p>
                    <Link to="/setup">
                        <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
                            Take your first Quiz
                        </button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard
                            icon={Target}
                            title="Total Interviews"
                            value={stats.total_interviews}
                            colorClass="#7C3AED"
                            delay={0.1}
                        />
                        <StatCard
                            icon={Award}
                            title="Average Score"
                            value={`${stats.average_score} / 10`}
                            subtitle="Overall performance"
                            colorClass="#06B6D4"
                            delay={0.3}
                        />
                        <StatCard
                            icon={Brain}
                            title="Best Category"
                            value={stats.best_category}
                            subtitle="Highest success rate"
                            colorClass="#F59E0B"
                            delay={0.4}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.trend_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Category Accuracy</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.category_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                                        <RechartsTooltip
                                            cursor={{ fill: '#F1F5F9' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="average_score" radius={[6, 6, 0, 0]}>
                                            {stats.category_data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06B6D4' : '#7C3AED'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Interview History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                        <th className="pb-3 font-medium px-4">Role</th>
                                        <th className="pb-3 font-medium px-4">Category</th>
                                        <th className="pb-3 font-medium px-4">Difficulty</th>
                                        <th className="pb-3 font-medium px-4">Date</th>
                                        <th className="pb-3 font-medium px-4">Score</th>
                                        <th className="pb-3 font-medium px-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((session, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + (idx * 0.05) }}
                                            key={session.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="py-4 px-4 font-medium text-slate-900">{session.job_role}</td>
                                            <td className="py-4 px-4 text-slate-600">
                                                <span className="bg-primary-blue/10 text-primary-blue px-2 py-1 rounded-md text-xs font-semibold">
                                                    {session.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 text-sm">{session.difficulty}</td>
                                            <td className="py-4 px-4 text-slate-500 text-sm flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(session.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-900">
                                                {session.overall_score}/10
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Link to={`/report/${session.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-purple hover:text-primary-blue transition-colors">
                                                    View Details <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-slate-500">
                                                No completed interviews found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
