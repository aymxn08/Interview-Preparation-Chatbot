import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewChat from './pages/InterviewChat';
import InterviewReport from './pages/InterviewReport';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Pages that use their own full-screen layout (no shared Navbar/padding)
const IMMERSIVE_ROUTES = ['/chat/', '/report/'];

function AppRoutes() {
  const location = useLocation();
  const isImmersive = IMMERSIVE_ROUTES.some(r => location.pathname.startsWith(r));

  if (isImmersive) {
    return (
      <div className="min-h-screen transition-all duration-300">
        <Routes>
          <Route path="/chat/:id"   element={<PrivateRoute><InterviewChat /></PrivateRoute>} />
          <Route path="/report/:id" element={<PrivateRoute><InterviewReport /></PrivateRoute>} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-all duration-300">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col z-10 relative">
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/signup"   element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/setup"    element={<PrivateRoute><InterviewSetup /></PrivateRoute>} />
          <Route path="*"         element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;