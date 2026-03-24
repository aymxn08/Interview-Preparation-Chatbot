import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-[-1] bg-slate-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-purple/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-cyan/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      </div>

      <Navbar />

      <main className="flex-grow pt-20 flex flex-col z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/setup" element={<PrivateRoute><InterviewSetup /></PrivateRoute>} />
          <Route path="/chat/:id" element={<PrivateRoute><InterviewChat /></PrivateRoute>} />
          <Route path="/report/:id" element={<PrivateRoute><InterviewReport /></PrivateRoute>} />
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