import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AITutor from './pages/AITutor';
import AIAssessment from './pages/AIAssessment';
import RiskPredictor from './pages/RiskPredictor';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthContext from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Profile from './pages/Profile';
import AITranslation from './pages/AITranslation';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster
        position='top-center'
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
        <Route path="/ai-assessment" element={<ProtectedRoute><AIAssessment /></ProtectedRoute>} />
        <Route path="/ai-translation" element={<ProtectedRoute><AITranslation /></ProtectedRoute>} />
        <Route path="/risk-predictor" element={<ProtectedRoute><RiskPredictor /></ProtectedRoute>} />
        <Route path='/profile' element = {<ProtectedRoute><Profile/></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;