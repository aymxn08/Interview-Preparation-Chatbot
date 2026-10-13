import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { Award, Briefcase, ChevronLeft, Layers, Settings, TrendingUp, RefreshCcw, ArrowRight } from 'lucide-react';
import API from '../api';

const InterviewReport = () => {
    const { id } = useParams();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API}/interview/report/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const turns = res.data.turns;
                const session = res.data.session;

                let relevanceSum = 0;
                let accuracySum = 0;
                let claritySum = 0;
                let confidenceSum = 0;
                let scoreSum = 0;

                const questionScores = turns.map((t, idx) => {
                    const evalData = JSON.parse(t.evaluation_json);
                    relevanceSum += evalData.relevance;
                    accuracySum += evalData.technical_accuracy;
                    claritySum += evalData.communication_clarity;
                    confidenceSum += evalData.confidence;
                    scoreSum += evalData.score;

                    return {
                        name: `Q${idx + 1}`,
                        score: evalData.score,
                    };
                });

                const turnCount = turns.length || 1;
                const skillRadarData = [
                    { subject: 'Relevance', A: relevanceSum / turnCount },
                    { subject: 'Tech', A: accuracySum / turnCount },
                    { subject: 'Clarity', A: claritySum / turnCount },
                    { subject: 'Confidence', A: confidenceSum / turnCount },
                    { subject: 'Overall', A: scoreSum / turnCount },
                ];

                const topStrengths = turns.map(t => JSON.parse(t.evaluation_json).strengths).filter(Boolean).slice(0, 3);
                const topImprovements = turns.map(t => JSON.parse(t.evaluation_json).suggested_improvement).filter(Boolean).slice(0, 3);

                setReportData({
                    session,
                    turns,
                    skillRadarData,
                    questionScores,
                    topStrengths,
                    topImprovements
                });
            } catch (err) {
                console.error("Failed to load report", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!reportData) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <p className="text-xl font-bold text-rose-500">Report not found</p>
            <Link to="/dashboard" className="text-primary-blue hover:underline">Back to Dashboard</Link>
        </div>
    );

    const { session, skillRadarData, questionScores, topStrengths, topImprovements } = reportData;

    return (
        <div className="min-h-screen transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 py-12 w-full pb-24">
                <Link to="/dashboard" className="inline-flex items-center text-[var(--text-s)] hover:text-primary-blue mb-8 font-medium transition-colors group">
                    <div className="p-1 rounded-lg bg-[var(--card-bg)] mr-2 group-hover:bg-primary-blue/10 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    Back to Dashboard
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-block p-5 rounded-3xl bg-gradient-primary mb-4 shadow-xl shadow-primary-purple/30">
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-p)] mb-2 tracking-tight">Interview Performance</h1>
                    <p className="text-lg text-[var(--text-s)] opacity-70">A detailed breakdown analyzed by PrepWise AI.</p>
                </motion.div>

                {/* Top Stats Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="glass-card p-8 md:p-10 flex flex-col md:flex-row justify-between items-center mb-12 relative overflow-hidden group"
                >
                    {/* Background glow effects */}
                    <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-primary-purple/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-purple/30 transition-all duration-700"></div>
                    <div className="absolute bottom-[-30%] right-[-5%] w-48 h-48 bg-primary-cyan/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-cyan/20 transition-all duration-700"></div>

                    <div className="flex flex-col md:flex-row gap-8 md:gap-16 z-10 w-full items-center">
                        <div className="text-center md:text-left">
                            <p className="text-[var(--text-s)] font-semibold mb-1 uppercase tracking-widest text-xs opacity-60">Final Score</p>
                            <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                <h2 className="text-7xl font-black text-gradient">
                                    {session.overall_score}
                                </h2>
                                <span className="text-2xl text-[var(--text-s)] font-bold opacity-40">/ 10</span>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)]">
                                <p className="text-[var(--text-s)] text-xs mb-1 uppercase font-bold opacity-50 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Role</p>
                                <p className="font-bold text-[var(--text-p)]">{session.job_role}</p>
                            </div>
                            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)]">
                                <p className="text-[var(--text-s)] text-xs mb-1 uppercase font-bold opacity-50 flex items-center gap-1.5"><Layers className="w-3 h-3" /> Category</p>
                                <p className="font-bold text-[var(--text-p)]">{session.category}</p>
                            </div>
                            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)]">
                                <p className="text-[var(--text-s)] text-xs mb-1 uppercase font-bold opacity-50 flex items-center gap-1.5"><Settings className="w-3 h-3" /> Level</p>
                                <p className="font-bold text-primary-cyan">{session.difficulty}</p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <button
                                onClick={() => navigate('/setup')}
                                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary-purple/40 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                Practice Again <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card p-8 h-[450px] flex flex-col"
                    >
                        <h3 className="text-xl font-bold text-[var(--text-p)] mb-2">Skill Fingerprint</h3>
                        <p className="text-[var(--text-s)] text-sm mb-6 opacity-60">Visual breakdown of your performance metrics across all answers.</p>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                                    <PolarGrid stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-s)', fontSize: 11, fontWeight: 600 }} />
                                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                                    <Radar name="Score" dataKey="A" stroke="var(--color-primary-purple)" fill="var(--color-primary-purple)" fillOpacity={0.35} strokeWidth={2.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card p-8 h-[450px] flex flex-col"
                    >
                        <h3 className="text-xl font-bold text-[var(--text-p)] mb-2">Interview Progression</h3>
                        <p className="text-[var(--text-s)] text-sm mb-8 opacity-60">Tracking your consistency and response quality across all 10 questions.</p>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={questionScores} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-s)', fontSize: 11 }} dy={10} />
                                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-s)', fontSize: 11 }} />
                                    <Tooltip 
                                        cursor={{ fill: 'var(--card-hover)' }} 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--card-bg)', 
                                            borderRadius: '16px', 
                                            border: '1px solid var(--card-border)', 
                                            boxShadow: 'var(--shadow-soft)',
                                            backdropFilter: 'blur(10px)',
                                            color: 'var(--text-p)'
                                        }} 
                                    />
                                    <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={24}>
                                        {questionScores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 8 ? '#22C55E' : entry.score >= 6 ? '#F59E0B' : '#EF4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* AI Text Feedback Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="p-8 rounded-[2rem] border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/10">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-p)]">Key Strengths</h3>
                        </div>
                        <div className="space-y-4">
                            {topStrengths.map((str, i) => (
                                <div key={i} className="flex gap-4 items-start bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--card-border)]">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <p className="text-[var(--text-p)] text-sm leading-relaxed font-medium">{str}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="p-8 rounded-[2rem] border border-primary-blue/10 bg-primary-blue/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary-blue/10 rounded-2xl text-primary-blue border border-primary-blue/10">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-p)]">Improvement Roadmap</h3>
                        </div>
                        <div className="space-y-4">
                            {topImprovements.map((imp, i) => (
                                <div key={i} className="flex gap-4 items-start bg-[var(--card-bg)] p-5 rounded-2xl shadow-sm border border-[var(--card-border)]">
                                    <div className="w-6 h-6 rounded-full bg-primary-blue/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary-blue/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
                                    </div>
                                    <p className="text-[var(--text-p)] text-sm leading-relaxed font-medium">{imp}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default InterviewReport;
