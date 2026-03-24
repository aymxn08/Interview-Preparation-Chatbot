import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { Award, Briefcase, ChevronLeft, Layers, Settings, TrendingUp, RefreshCcw } from 'lucide-react';

const InterviewReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:8000/api/interview/report/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Process the raw turns into report-ready data
                const session = res.data.session;
                const turns = res.data.turns;

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
                    { subject: 'Relevance', A: relevanceSum / turnCount, fullMark: 10 },
                    { subject: 'Tech Accuracy', A: accuracySum / turnCount, fullMark: 10 },
                    { subject: 'Clarity', A: claritySum / turnCount, fullMark: 10 },
                    { subject: 'Confidence', A: confidenceSum / turnCount, fullMark: 10 },
                    { subject: 'Overall', A: scoreSum / turnCount, fullMark: 10 },
                ];

                // Grab the best string strengths/weaknesses to display
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
                // Could retry or show error
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-slate-500 font-medium mt-20">Analyzing interview performance...</div>;
    if (!reportData) return <div className="p-12 text-center text-rose-500 font-medium">Failed to load report.</div>;

    const { session, skillRadarData, questionScores, topStrengths, topImprovements } = reportData;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 w-full pb-24">
            <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-primary-blue mb-8 font-medium transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-primary-blue to-primary-purple mb-4 shadow-lg shadow-primary-purple/20">
                    <Award className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Interview Analysis Report</h1>
                <p className="text-lg text-slate-600">Detailed breakdown of your AI-evaluated performance.</p>
            </motion.div>

            {/* Top Stats Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center mb-12 text-white relative overflow-hidden"
            >
                {/* Decorative glow */}
                <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-primary-purple/30 rounded-full blur-3xl"></div>

                <div className="flex gap-8 md:gap-16 z-10 w-full justify-between items-center flex-wrap">
                    <div>
                        <p className="text-slate-400 font-medium mb-1 uppercase tracking-widest text-sm">Final Score</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                {session.overall_score}
                            </h2>
                            <span className="text-2xl text-slate-500 font-bold">/ 10</span>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div>
                            <p className="text-slate-400 text-sm mb-1 flex items-center gap-1"><Briefcase className="w-4 h-4" /> Role</p>
                            <p className="font-bold text-lg">{session.job_role}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1 flex items-center gap-1"><Layers className="w-4 h-4" /> Category</p>
                            <p className="font-bold text-lg">{session.category}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1 flex items-center gap-1"><Settings className="w-4 h-4" /> Level</p>
                            <p className="font-bold text-lg text-cyan-400">{session.difficulty}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/setup')}
                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                        <RefreshCcw className="w-5 h-5" /> Try Again
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-8 h-[400px] flex flex-col items-center"
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-2 w-full text-left">Skill Breakdown</h3>
                    <p className="text-slate-500 text-sm w-full text-left mb-4">Average scores across all evaluation metrics.</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillRadarData}>
                            <PolarGrid stroke="#E2E8F0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} max={10} tick={{ fill: '#94A3B8' }} />
                            <Radar name="Performance" dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Progress Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card p-8 h-[400px] flex flex-col"
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Question Progression</h3>
                    <p className="text-slate-500 text-sm mb-8">Score (out of 10) for each question answered.</p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={questionScores}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="score" radius={[8, 8, 8, 8]}>
                                    {questionScores.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score >= 7 ? '#22C55E' : entry.score >= 5 ? '#F59E0B' : '#EF4444'} />
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
                    className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Key Strengths</h3>
                    </div>
                    <ul className="space-y-4">
                        {topStrengths.map((str, i) => (
                            <li key={i} className="flex gap-3 text-emerald-900 font-medium bg-white p-4 rounded-xl shadow-sm border border-emerald-50">
                                <span className="text-emerald-500 font-bold">•</span> {str}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <TrendingUp className="w-6 h-6 transform rotate-90" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-4">
                        {topImprovements.map((imp, i) => (
                            <li key={i} className="flex gap-3 text-blue-900 font-medium bg-white p-4 rounded-xl shadow-sm border border-blue-50">
                                <span className="text-blue-500 font-bold">•</span> {imp}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>

        </div>
    );
};

export default InterviewReport;
