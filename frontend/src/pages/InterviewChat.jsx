import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Send, Bot, User as UserIcon, LayoutDashboard, LogOut,
    TrendingUp, TrendingDown, CheckCircle2, Star, Zap,
    Target, ArrowRight, BarChart2, MessageSquare
} from 'lucide-react';

const API = 'http://localhost:8000/api';
const MAX_QUESTIONS = 10;

/* ─────────────────────────────────────────
   Typing dots indicator
   ───────────────────────────────────────── */
const TypingDots = () => (
    <div className="flex items-center gap-1 px-1 py-1">
        {[0, 0.2, 0.4].map((d, i) => (
            <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400"
                animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: d }}
            />
        ))}
        <span className="ml-2 text-xs text-purple-300 font-medium">AI is thinking…</span>
    </div>
);

/* ─────────────────────────────────────────
   Typing-effect text renderer
   ───────────────────────────────────────── */
const TypingText = ({ text, onDone }) => {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        let i = 0;
        const iv = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) { clearInterval(iv); onDone && onDone(); }
        }, 18);
        return () => clearInterval(iv);
    }, [text]);
    return <span>{displayed}</span>;
};

/* ─────────────────────────────────────────
   Metric Bar
   ───────────────────────────────────────── */
const MetricBar = ({ label, value }) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">{label}</span>
            <span className="text-white font-bold">{value}/10</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${(value / 10) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />
        </div>
    </div>
);

/* ─────────────────────────────────────────
   Feedback Card
   ───────────────────────────────────────── */
const FeedbackCard = ({ ev }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-3 ml-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 max-w-2xl"
    >
        {/* Score header */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">AI Evaluation</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold text-sm">
                {ev.score}/10
            </div>
        </div>

        {/* Metric bars */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            <MetricBar label="Relevance" value={ev.relevance} />
            <MetricBar label="Technical Accuracy" value={ev.technical_accuracy} />
            <MetricBar label="Communication" value={ev.communication_clarity} />
            <MetricBar label="Confidence" value={ev.confidence} />
        </div>

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-3">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1">
                    <TrendingUp className="w-3 h-3" /> Strengths
                </div>
                <p className="text-slate-300">{ev.strengths}</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-400/20 rounded-xl p-3">
                <div className="flex items-center gap-1 text-rose-400 font-semibold mb-1">
                    <TrendingDown className="w-3 h-3" /> Weaknesses
                </div>
                <p className="text-slate-300">{ev.weaknesses}</p>
            </div>
        </div>

        {/* Ideal answer */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-1 text-blue-400 font-semibold mb-1">
                <CheckCircle2 className="w-3 h-3" /> Ideal Answer
            </div>
            <p className="text-slate-300 italic">{ev.ideal_sample_answer}</p>
        </div>

        {/* Improvement tip */}
        <div className="mt-3 flex gap-2 items-start bg-purple-500/10 border border-purple-400/20 rounded-xl p-3 text-xs">
            <Zap className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
            <p className="text-slate-300">{ev.suggested_improvement}</p>
        </div>
    </motion.div>
);

/* ─────────────────────────────────────────
   Main Component
   ───────────────────────────────────────── */
const InterviewChat = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);
    const [typingMsgIdx, setTypingMsgIdx] = useState(null);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    /* scroll to bottom whenever messages change */
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    /* initialise the chat */
    useEffect(() => {
        const init = async () => {
            setIsTyping(true);
            try {
                /* If coming fresh from Setup, location.state carries {question, sessionId} */
                const stateQuestion = location.state?.question;
                const stateSessionId = location.state?.sessionId;

                if (stateQuestion) {
                    /* Fresh start — load session metadata then push Q1 */
                    const { data } = await axios.get(`${API}/interview/report/${id}`, { headers: headers() });
                    setSession(data.session);
                    setProgress(1);
                    addAiMessage(stateQuestion);

                } else {
                    /* Resuming an existing session */
                    const { data } = await axios.get(`${API}/interview/report/${id}`, { headers: headers() });
                    setSession(data.session);
                    setIsCompleted(data.session.is_completed);

                    if (data.turns.length === 0) {
                        /* Edge-case: no turns yet, generate Q1 via a fresh setup call */
                        const s = data.session;
                        const { data: setupData } = await axios.post(`${API}/interview/setup`, {
                            job_role: s.job_role, category: s.category, difficulty: s.difficulty
                        }, { headers: headers() });
                        navigate(`/chat/${setupData.session_id}`, { replace: true, state: { question: setupData.question } });
                        return;
                    }

                    /* Rebuild message history */
                    const rebuilt = [];
                    data.turns.forEach(t => {
                        rebuilt.push({ type: 'ai', text: t.question, animate: false });
                        rebuilt.push({ type: 'user', text: t.user_answer });
                        rebuilt.push({ type: 'feedback', ev: JSON.parse(t.evaluation_json) });
                    });
                    setMessages(rebuilt);
                    setProgress(data.turns.length + 1);
                }
            } catch (e) {
                console.error(e);
                navigate('/setup');
            } finally {
                setIsTyping(false);
            }
        };
        init();
    }, [id]);

    const addAiMessage = (text, animate = true) => {
        setMessages(prev => {
            const idx = prev.length;
            setTypingMsgIdx(animate ? idx : null);
            return [...prev, { type: 'ai', text, animate }];
        });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const answer = input.trim();
        if (!answer || isSending || isCompleted) return;

        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: answer }]);
        setIsSending(true);
        setIsTyping(true);

        try {
            /* find last AI question as the 'question' param */
            const lastAi = [...messages].reverse().find(m => m.type === 'ai');
            const { data } = await axios.post(`${API}/interview/chat`, {
                session_id: parseInt(id),
                question: lastAi?.text || '',
                user_answer: answer
            }, { headers: headers() });

            const { evaluation, next_question, is_completed } = data;

            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'feedback', ev: evaluation }]);

            if (is_completed) {
                setIsCompleted(true);
                setMessages(prev => [...prev, {
                    type: 'ai',
                    text: "That's all 10 questions! You've completed the interview. View your detailed report below.",
                    animate: true
                }]);
                setProgress(MAX_QUESTIONS);
            } else {
                addAiMessage(next_question, true);
                setProgress(prev => Math.min(prev + 1, MAX_QUESTIONS));
            }
        } catch (err) {
            console.error(err);
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'ai', text: 'An error occurred. Please try again.', animate: false }]);
        } finally {
            setIsSending(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const progressPct = ((progress - 1) / MAX_QUESTIONS) * 100;

    return (
        <div className="flex h-[calc(100vh-0px)] w-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f0c29 100%)' }}
        >
            {/* ── LEFT SIDEBAR ── */}
            <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-white/10 bg-black/30 backdrop-blur-xl p-6 gap-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-extrabold text-lg tracking-tight">PrepWise <span className="text-purple-400">AI</span></span>
                </div>

                <hr className="border-white/10" />

                {/* Session info */}
                {session && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Session Details</p>
                        {[
                            { label: 'Role', value: session.job_role },
                            { label: 'Category', value: session.category },
                            { label: 'Difficulty', value: session.difficulty },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-slate-500 text-xs">{label}</p>
                                <p className="text-white font-semibold text-sm">{value}</p>
                            </div>
                        ))}
                    </div>
                )}

                <hr className="border-white/10" />

                {/* Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400 font-medium">Progress</span>
                        <span className="text-purple-400 font-bold">Q {Math.min(progress, MAX_QUESTIONS)} / {MAX_QUESTIONS}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>Start</span><span>Finish</span>
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    {isCompleted && (
                        <motion.button
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate(`/report/${id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/30 transition-all"
                        >
                            <BarChart2 className="w-4 h-4" /> View Report <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    )}
                    <Link to="/dashboard"
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium py-2 px-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                </div>
            </aside>

            {/* ── CENTER CHAT AREA ── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile top bar */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10 backdrop-blur-xl">
                    <span className="text-white font-bold">PrepWise <span className="text-purple-400">AI</span></span>
                    <span className="text-purple-300 text-sm font-bold">Q {Math.min(progress, MAX_QUESTIONS)}/{MAX_QUESTIONS}</span>
                    {isCompleted && (
                        <button onClick={() => navigate(`/report/${id}`)} className="text-cyan-400 font-bold text-sm">Report →</button>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-8 px-4 md:px-12 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {msg.type === 'feedback' ? (
                                    <FeedbackCard ev={msg.ev} />
                                ) : msg.type === 'ai' ? (
                                    <div className="flex items-start gap-3 max-w-3xl">
                                        {/* AI avatar */}
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20 mt-0.5">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl max-w-2xl"
                                            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.18) 100%)', border: '1px solid rgba(124,58,237,0.25)' }}
                                        >
                                            <p className="text-white text-base leading-relaxed font-medium">
                                                {msg.animate && typingMsgIdx === idx
                                                    ? <TypingText text={msg.text} onDone={() => setTypingMsgIdx(null)} />
                                                    : msg.text
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 justify-end">
                                        <div className="rounded-2xl rounded-tr-sm px-5 py-4 shadow-xl max-w-2xl"
                                            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(79,70,229,0.18) 100%)', border: '1px solid rgba(6,182,212,0.25)' }}
                                        >
                                            <p className="text-white text-base leading-relaxed">{msg.text}</p>
                                        </div>
                                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                                            <UserIcon className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {isTyping && (
                            <motion.div
                                key="typing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-start gap-3"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="rounded-2xl rounded-tl-sm px-5 py-3 shadow-xl"
                                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.18) 100%)', border: '1px solid rgba(124,58,237,0.25)' }}
                                >
                                    <TypingDots />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                </div>

                {/* ── INPUT BAR ── */}
                <div className="shrink-0 px-4 md:px-12 py-4 bg-black/30 border-t border-white/10 backdrop-blur-xl">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                            }}
                            disabled={isSending || isCompleted}
                            placeholder={isCompleted ? 'Interview completed — view your report →' : 'Type your answer here…'}
                            rows={3}
                            className="w-full rounded-2xl py-4 pl-5 pr-16 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={!input.trim() || isSending || isCompleted}
                            className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isSending && !isCompleted
                                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-600/30 text-white'
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </form>
                    <p className="text-center text-xs text-slate-600 mt-2 hidden md:block">
                        Press <kbd className="bg-white/10 text-slate-400 px-1.5 py-0.5 rounded text-xs">Enter</kbd> to send · <kbd className="bg-white/10 text-slate-400 px-1.5 py-0.5 rounded text-xs">Shift+Enter</kbd> for new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InterviewChat;
