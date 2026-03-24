import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, Target, TrendingUp, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300"
    >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-purple/10 to-primary-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-primary-blue" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
);

const Home = () => {
    return (
        <div className="flex-col flex items-center w-full">
            {/* Hero Section */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 text-primary-blue font-semibold mb-8 border border-primary-blue/20"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-blue"></span>
                        </span>
                        PrepWise AI 2.0 is live
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                        Master Your Interviews with <span className="text-gradient">AI</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Practice real interview questions with instant feedback and performance tracking. Land your dream job faster.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/signup">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-primary px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl shadow-primary-purple/30 w-full sm:w-auto"
                            >
                                Start Practicing Free
                            </motion.button>
                        </Link>
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="glass-card px-8 py-4 rounded-full text-slate-900 font-bold text-lg hover:bg-slate-50 w-full sm:w-auto"
                            >
                                Sign In
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-200">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
                    <p className="text-slate-600 text-lg">Powerful features designed to supercharge your interview preparation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={BrainCircuit}
                        title="AI Generated Questions"
                        description="Tailored MCQs based on your selected job role, category, and difficulty level."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Instant Feedback"
                        description="Get immediate explanations for correct and incorrect answers to learn faster."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Target}
                        title="Skill Tracking"
                        description="Visualize your performance over time and identify weak areas to improve."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={TrendingUp}
                        title="Analytics Dashboard"
                        description="Comprehensive charts and stats to ensure you're ready for the big day."
                        delay={0.4}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;
