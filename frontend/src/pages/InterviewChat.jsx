import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Send, Bot, User as UserIcon, LayoutDashboard, History,
  TrendingUp, TrendingDown, CheckCircle2, Star, Zap,
  ArrowRight, BarChart2, LogOut, Target, Brain, MessageSquare,
  ChevronRight,
} from 'lucide-react';

const API = 'http://localhost:8000/api';
const MAX_Q = 10;

/* ── helpers ─────────────────────────────────────────── */
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const scoreColor = (s) => {
  if (s >= 8) return '#22C55E';
  if (s >= 6) return '#F59E0B';
  return '#EF4444';
};

/* ── Animated counter ───────────────────────────────── */
const Counter = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    const step = () => {
      start += 1;
      setDisplay(start);
      if (start < value) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}</span>;
};

/* ── Typing dots ─────────────────────────────────────── */
const TypingDots = () => (
  <div className="flex items-center gap-1.5 py-1 px-1">
    {[0, 0.18, 0.36].map((d, i) => (
      <motion.span key={i} className="w-2 h-2 rounded-full bg-purple-400"
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: d }}
      />
    ))}
    <span className="text-xs text-purple-300 ml-2 font-medium">AI is thinking…</span>
  </div>
);

/* ── Typing‑effect text ──────────────────────────────── */
const TypingText = ({ text, onDone }) => {
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setShown(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(iv); onDone?.(); }
    }, 16);
    return () => clearInterval(iv);
  }, [text]);
  return <>{shown}</>;
};

/* ── Metric progress bar ─────────────────────────────── */
const MetricRow = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold" style={{ color: scoreColor(value) }}>{value}/10</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(value / 10) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg, #7C3AED, #06B6D4)` }}
      />
    </div>
  </div>
);

/* ── Feedback card (inside chat) ─────────────────────── */
const FeedbackCard = ({ ev }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="ml-11 mt-2 max-w-2xl rounded-2xl p-4 text-sm"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
        <Star className="w-3.5 h-3.5 fill-current" /> AI Evaluation
      </div>
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
        style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
        {ev.score}/10
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
      <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <p className="text-emerald-400 font-semibold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Strengths</p>
        <p className="text-slate-300">{ev.strengths}</p>
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <p className="text-rose-400 font-semibold mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" />Weaknesses</p>
        <p className="text-slate-300">{ev.weaknesses}</p>
      </div>
    </div>
    <div className="rounded-xl p-3 mb-2 text-xs" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
      <p className="text-cyan-400 font-semibold mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Ideal Answer</p>
      <p className="text-slate-300 italic">{ev.ideal_sample_answer}</p>
    </div>
    <div className="rounded-xl p-3 text-xs flex gap-2 items-start"
      style={{ background: 'rgba(79,70,229,0.10)', border: '1px solid rgba(79,70,229,0.18)' }}>
      <Zap className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
      <p className="text-slate-300">{ev.suggested_improvement}</p>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function InterviewChat() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [history, setHistory] = useState([]);   // past sessions for sidebar
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [typingIdx, setTypingIdx] = useState(null);

  // Right panel live metrics (latest evaluation)
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [avgScore, setAvgScore] = useState(0);
  const [scores, setScores] = useState([]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  /* ── fetch history for sidebar ── */
  useEffect(() => {
    axios.get(`${API}/interview/history`, { headers: headers() })
      .then(r => setHistory(r.data.history || []))
      .catch(() => {});
  }, []);

  /* ── init chat ── */
  useEffect(() => {
    const init = async () => {
      setIsTyping(true);
      try {
        const stateQ = location.state?.question;
        const { data } = await axios.get(`${API}/interview/report/${id}`, { headers: headers() });
        setSession(data.session);
        setIsCompleted(data.session.is_completed);

        if (stateQ && data.turns.length === 0) {
          pushAi(stateQ, true);
          setProgress(1);
        } else if (data.turns.length > 0) {
          const rebuilt = [];
          const s = [];
          data.turns.forEach(t => {
            rebuilt.push({ type: 'ai', text: t.question, animate: false });
            rebuilt.push({ type: 'user', text: t.user_answer });
            const ev = JSON.parse(t.evaluation_json);
            rebuilt.push({ type: 'feedback', ev });
            s.push(ev.score);
          });
          setMessages(rebuilt);
          setProgress(data.turns.length + 1);
          setScores(s);
          setAvgScore(s.reduce((a, b) => a + b, 0) / s.length);
          setLiveMetrics(JSON.parse(data.turns[data.turns.length - 1].evaluation_json));
        } else {
          // No state and no turns — re-setup
          const { data: sd } = await axios.post(`${API}/interview/setup`, {
            job_role: data.session.job_role,
            category: data.session.category,
            difficulty: data.session.difficulty,
          }, { headers: headers() });
          navigate(`/chat/${sd.session_id}`, { replace: true, state: { question: sd.question } });
          return;
        }
      } catch (e) {
        navigate('/setup');
      } finally {
        setIsTyping(false);
      }
    };
    init();
  }, [id]);

  /* ── helper: add AI message ── */
  const pushAi = (text, animate = true) => {
    setMessages(prev => {
      const idx = prev.length;
      if (animate) setTypingIdx(idx);
      return [...prev, { type: 'ai', text, animate }];
    });
  };

  /* ── send answer ── */
  const handleSend = async (e) => {
    e.preventDefault();
    const answer = input.trim();
    if (!answer || isSending || isCompleted) return;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: answer }]);
    setIsSending(true);
    setIsTyping(true);
    try {
      const lastAi = [...messages].reverse().find(m => m.type === 'ai');
      const { data } = await axios.post(`${API}/interview/chat`, {
        session_id: parseInt(id),
        question: lastAi?.text || '',
        user_answer: answer,
      }, { headers: headers() });

      const { evaluation: ev, next_question, is_completed } = data;
      setIsTyping(false);

      const newScores = [...scores, ev.score];
      setScores(newScores);
      setAvgScore(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      setLiveMetrics(ev);

      setMessages(prev => [...prev, { type: 'feedback', ev }]);

      if (is_completed) {
        setIsCompleted(true);
        setProgress(MAX_Q);
        pushAi("That's all 10 questions — great effort! Your full report is ready.", true);
      } else {
        pushAi(next_question, true);
        setProgress(p => Math.min(p + 1, MAX_Q));
      }
    } catch {
      setIsTyping(false);
      pushAi('An error occurred. Please try again.', false);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const radarData = liveMetrics ? [
    { subject: 'Relevance', A: liveMetrics.relevance },
    { subject: 'Tech', A: liveMetrics.technical_accuracy },
    { subject: 'Clarity', A: liveMetrics.communication_clarity },
    { subject: 'Confidence', A: liveMetrics.confidence },
    { subject: 'Overall', A: liveMetrics.score },
  ] : [];

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0718 0%, #0f0c29 50%, #0a0420 100%)' }}>

      {/* ══ LEFT SIDEBAR ══════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">
              PrepWise <span style={{ color: '#a78bfa' }}>AI</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link to="/setup"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))', border: '1px solid rgba(124,58,237,0.3)' }}>
            <MessageSquare className="w-4 h-4" /> New Interview
          </Link>
          <Link to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </nav>

        {/* Recent history */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2 px-2">Recent Sessions</p>
          {history.slice(0, 8).map(s => (
            <Link key={s.id} to={`/report/${s.id}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-1">
              <span className="truncate">{s.job_role} — {s.category}</span>
              <span className="font-bold shrink-0 ml-2" style={{ color: scoreColor(s.overall_score) }}>
                {s.overall_score}/10
              </span>
            </Link>
          ))}
          {history.length === 0 && (
            <p className="text-xs text-slate-600 px-2">No completed interviews yet.</p>
          )}
        </div>

        {/* Bottom */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ══ CENTER CHAT ═══════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile + session info) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            {session && (
              <div className="text-xs text-slate-400">
                <span className="text-white font-semibold">{session.job_role}</span>
                <span className="mx-1.5">·</span>{session.category}
                <span className="mx-1.5">·</span>
                <span style={{ color: '#a78bfa' }}>{session.difficulty}</span>
              </div>
            )}
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold" style={{ color: '#a78bfa' }}>
              Q {Math.min(progress, MAX_Q)} / {MAX_Q}
            </div>
            <div className="w-24 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full"
                animate={{ width: `${((progress - 1) / MAX_Q) * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{ background: 'linear-gradient(90deg, #7C3AED, #06B6D4)' }} />
            </div>
            {isCompleted && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(`/report/${id}`)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: '#fff' }}>
                <BarChart2 className="w-3.5 h-3.5" /> Report <ArrowRight className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28 }}>
                {msg.type === 'feedback' ? (
                  <FeedbackCard ev={msg.ev} />
                ) : msg.type === 'ai' ? (
                  <div className="flex items-start gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
                      <Bot className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-white shadow-xl max-w-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.12))', border: '1px solid rgba(124,58,237,0.2)' }}>
                      {msg.animate && typingIdx === idx
                        ? <TypingText text={msg.text} onDone={() => setTypingIdx(null)} />
                        : msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white shadow-xl max-w-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(79,70,229,0.15))', border: '1px solid rgba(6,182,212,0.2)' }}>
                      {msg.text}
                    </div>
                    <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <UserIcon className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div key="dots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-2 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.12))', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 md:px-10 py-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              disabled={isSending || isCompleted}
              placeholder={isCompleted ? 'Interview complete — view your report →' : 'Type your answer here…'}
              rows={3}
              className="w-full rounded-2xl py-4 pl-5 pr-14 text-white placeholder-slate-600 resize-none focus:outline-none focus:ring-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', focusRingColor: '#7C3AED' }}
            />
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
              type="submit"
              disabled={!input.trim() || isSending || isCompleted}
              className="absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={input.trim() && !isSending && !isCompleted
                ? { background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 0 14px rgba(124,58,237,0.5)' }
                : { background: 'rgba(255,255,255,0.06)', cursor: 'not-allowed' }}>
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </form>
          <p className="text-center text-xs text-slate-700 mt-2 hidden md:block">
            <kbd className="bg-white/5 px-1.5 py-0.5 rounded text-slate-500">Enter</kbd> to send ·{' '}
            <kbd className="bg-white/5 px-1.5 py-0.5 rounded text-slate-500">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>

      {/* ══ RIGHT ANALYTICS PANEL ═════════════════════ */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l overflow-y-auto"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Live Analytics</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Average score */}
          <div className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <p className="text-xs text-slate-500 mb-1">Average Score</p>
            <p className="text-5xl font-black" style={{ color: scoreColor(Math.round(avgScore)) }}>
              {scores.length > 0 ? <Counter value={Math.round(avgScore)} /> : '—'}
            </p>
            <p className="text-xs text-slate-600 mt-1">out of 10</p>
          </div>

          {/* Per-question scores */}
          {scores.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">Question Scores</p>
              <div className="space-y-1.5">
                {scores.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-4 shrink-0">Q{i + 1}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${(s / 10) * 100}%` }}
                        transition={{ duration: 0.7, delay: i * 0.05 }}
                        style={{ background: scoreColor(s) }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-right" style={{ color: scoreColor(s) }}>{s}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live metrics from last evaluation */}
          {liveMetrics ? (
            <>
              <div>
                <p className="text-xs text-slate-500 mb-3 font-medium">Last Answer Metrics</p>
                <MetricRow label="Relevance" value={liveMetrics.relevance} />
                <MetricRow label="Technical Accuracy" value={liveMetrics.technical_accuracy} />
                <MetricRow label="Clarity" value={liveMetrics.communication_clarity} />
                <MetricRow label="Confidence" value={liveMetrics.confidence} />
              </div>

              {/* Radar chart */}
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Skill Radar</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.35} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Target className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">Analytics will appear after<br />your first answer.</p>
            </div>
          )}

          {/* Report button */}
          {isCompleted && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => navigate(`/report/${id}`)}
              className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              <BarChart2 className="w-4 h-4" /> Full Report <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </aside>
    </div>
  );
}
