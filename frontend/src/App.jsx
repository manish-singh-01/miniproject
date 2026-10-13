import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Report from './pages/Report';
import Shelters from './pages/Shelters';
import Emergency from './pages/Emergency';
import Safety from './pages/Safety';
import AdminDashboard from './pages/AdminDashboard';
import ResponderDashboard from './pages/ResponderDashboard';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public pages with Navbar */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/alerts" element={<><Navbar /><Alerts /></>} />
        <Route path="/shelters" element={<><Navbar /><Shelters /></>} />
        <Route path="/emergency" element={<><Navbar /><Emergency /></>} />
        <Route path="/safety" element={<><Navbar /><Safety /></>} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected pages */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Navbar />
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/responder"
          element={
            <ProtectedRoute roles={['responder', 'admin']}>
              <ResponderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
