import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // ✅ fixed this line!
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

function App() {
  return (
    <div className="bg-gradient-to-br from-green-200 via-slate-300 to-green-400">
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/*Dashboard routes with layout and outlet */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route
              path="attendance"
              element={
                <div>
                  <Attendance />
                </div>
              }
            />
            <Route
              path="settings"
              element={
                <>
                  <Settings />
                </>
              }
            />
            <Route
              path="scan"
              element={
                <>
                  <ScanQR />
                </>
              }
            />
            <Route
              path="generate"
              element={
                <>
                  <GenerateQR />
                </>
              }
            />
            {/* <Route path="profile" element={<><Settings/></>} /> */}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default App;
