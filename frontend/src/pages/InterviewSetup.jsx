import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Layers, Settings, ArrowRight } from 'lucide-react';

const ROLES = ['Software Developer', 'Data Analyst', 'UI UX Designer', 'Product Manager', 'Marketing Executive'];
const CATEGORIES = ['Technical', 'HR', 'Behavioral'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const InterviewSetup = () => {
    const [role, setRole] = useState(ROLES[0]);
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleStart = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8000/api/interview/setup',
                { job_role: role, category, difficulty },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/chat/${res.data.session_id}`, {
                state: { question: res.data.question, sessionId: res.data.session_id }
            });
        } catch (error) {
            console.error("Failed to generate questions", error);
            alert("Failed to generate questions. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Configure Your Session</h1>
                <p className="text-lg text-slate-600">Tailor the AI generated questions to your specific needs.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 sm:p-10"
            >
                <form onSubmit={handleStart} className="space-y-8">
                    {/* Job Role */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary-purple" />
                            Target Role
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {ROLES.map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === r
                                        ? 'border-primary-purple bg-primary-purple/10 text-primary-purple shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-purple/30'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Category */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary-blue" />
                            Interview Category
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {CATEGORIES.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${category === c
                                        ? 'border-primary-blue bg-primary-blue/10 text-primary-blue shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-blue/30'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Difficulty */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary-cyan" />
                            Difficulty Level
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDifficulty(d)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${difficulty === d
                                        ? 'border-primary-cyan bg-primary-cyan/10 text-primary-cyan shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-cyan/30'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-primary text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-xl shadow-primary-blue/30 flex justify-center items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? 'Starting Interview...' : 'Start Interview'}
                            {!loading && <ArrowRight className="w-6 h-6" />}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default InterviewSetup;
