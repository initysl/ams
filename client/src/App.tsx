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
import GenerateQR from "./pages/dashboard/Lecturer/GenerateQR";
import ScanQR from "./pages/dashboard/Student/ScanQR";
import ForgetPass from "./pages/auth/ForgetPass";
import ResetPass from "./pages/auth/ResetPass";
import ProtectedRoute from "./context/ProtectedRoutes";
import Feedback from "./pages/dashboard/Settings/Feedback";
import About from "./pages/dashboard/Settings/About";
import Profile from "./pages/dashboard/Settings/Profile";

function App() {
  return (
    <div className="bg-gradient-to-b from-slate-100 to-green-100">
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

            {/* Settings section with nested routes */}
            <Route path="settings" element={<Settings />}>
              {/* Redirect to profile when just "/dashboard/settings" is accessed */}
              <Route
                index
                element={<Navigate to="/dashboard/settings/profile" replace />}
              />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
              <Route path="feedback" element={<Feedback />} />
            </Route>
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
