import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#0a0718,#0f0c29)' }}>
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
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
      <Routes>
        <Route path="/chat/:id"   element={<PrivateRoute><InterviewChat /></PrivateRoute>} />
        <Route path="/report/:id" element={<PrivateRoute><InterviewReport /></PrivateRoute>} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] bg-slate-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-purple/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-cyan/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </div>

      <Navbar />

      <main className="flex-grow pt-20 flex flex-col z-10">
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/signup"   element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/setup"    element={<PrivateRoute><InterviewSetup /></PrivateRoute>} />
          {/* catch-all */}
          <Route path="*"         element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;