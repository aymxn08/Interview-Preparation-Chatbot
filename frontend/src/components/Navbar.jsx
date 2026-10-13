import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, Brain, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 glass-card rounded-none border-x-0 border-t-0 shadow-sm transition-all h-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-gradient-primary rounded-xl group-hover:shadow-lg transition-all duration-300">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-[var(--text-p)] group-hover:text-primary-blue transition-colors">
                                PrepWise<span className="text-gradient"> AI</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4 md:space-x-6">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-p)] hover:bg-[var(--card-hover)] transition-all shadow-sm"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-primary-blue" />}
                        </button>

                        {!user ? (
                            <>
                                <Link to="/login" className="text-[var(--text-s)] hover:text-primary-blue font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="hidden sm:block bg-[var(--text-p)] text-[var(--bg-main)] hover:bg-gradient-primary hover:text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                                    Start Practicing
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard" className="flex items-center gap-2 text-[var(--text-s)] hover:text-primary-blue font-medium transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <div className="h-6 w-px bg-[var(--card-border)] hidden sm:block"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-[var(--text-s)] hover:text-secondary-red font-medium transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
