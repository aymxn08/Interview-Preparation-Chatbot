import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Brain } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 glass-card rounded-none border-x-0 border-t-0 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-gradient-primary rounded-xl group-hover:shadow-lg group-hover:shadow-primary-purple/30 transition-all duration-300">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 group-hover:text-primary-blue transition-colors">
                                PrepWise<span className="text-gradient"> AI</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        {!user ? (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-primary-blue font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-slate-900 hover:bg-gradient-primary text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary-blue/30 transform hover:-translate-y-0.5">
                                    Start Practicing
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-primary-blue font-medium transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-slate-200"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-slate-600 hover:text-secondary-red font-medium transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
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
