import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute, { RoleProtectedRoute } from "@/context/ProtectedRoutes";
import AuthForm from "@/features/auth/pages/AuthForm";
import ForgetPass from "@/features/auth/pages/ForgetPass";
import ResetPass from "@/features/auth/pages/ResetPass";
import VerifyEmail from "@/features/auth/pages/VerifyEmail";
import Attendance from "@/features/attendance/pages/Attendance";
import GenerateQR from "@/features/attendance/pages/lecturer/GenerateQR";
import ScanQR from "@/features/attendance/pages/student/ScanQR";
import Home from "@/features/dashboard/pages/Home";
import Layout from "@/features/dashboard/pages/Layout";
import About from "@/features/settings/pages/About";
import Feedback from "@/features/settings/pages/Feedback";
import Profile from "@/features/settings/pages/Profile";
import Settings from "@/features/settings/pages/Settings";
import SplashScreen from "@/features/splash/pages/SplashScreen";

const Unauthorized = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Small delay to ensure smooth transition
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return <Navigate to="/dashboard/home" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/recover" element={<ForgetPass />} />
      <Route path="/reset" element={<ResetPass />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

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

        {/* Routes accessible to all authenticated users */}
        <Route path="home" element={<Home />} />
        <Route path="attendance" element={<Attendance />} />

        {/* Lecturer-only route */}
        <Route
          path="generate"
          element={
            <RoleProtectedRoute
              allowedRoles={["lecturer"]}
              redirectTo="/unauthorized"
            >
              <GenerateQR />
            </RoleProtectedRoute>
          }
        />

        {/* Student-only route */}
        <Route
          path="scan"
          element={
            <RoleProtectedRoute
              allowedRoles={["student"]}
              redirectTo="/unauthorized"
            >
              <ScanQR />
            </RoleProtectedRoute>
          }
        />

        {/* Settings section with nested routes - accessible to all authenticated users */}
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
  );
};

export default AppRoutes;
