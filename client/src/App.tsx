import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SplashScreen from "./pages/splash/SplashScreen";
import AuthForm from "./pages/auth/AuthForm";
import VerifyEmail from "./pages/email/VerifyEmail";
import { Toaster } from "sonner";
import Layout from "./pages/dashboard/Layout";
import Home from "./pages/dashboard/Home";
import Attendance from "./pages/dashboard/Attendance";
import Settings from "./pages/dashboard/Settings";
import GenerateQR from "./pages/dashboard/GenerateQR";
import ScanQR from "./pages/dashboard/ScanQR";
import ForgetPass from "./pages/auth/ForgetPass";
import ResetPass from "./pages/auth/ResetPass";
import ProtectedRoute from "./context/ProtectedRoutes";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-stone-300">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/recover" element={<ForgetPass />} />
          <Route path="/reset" element={<ResetPass />} />

          {/* Protected Dashboard routes using ProtectedRoute component */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute redirectTo="/auth">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="generate" element={<GenerateQR />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Redirect to splash screen for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default App;
