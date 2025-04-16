import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SplashScreen from "./pages/splash/SplashScreen";
import AuthForm from "./pages/auth/AuthForm";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh bg-gradient-to-br from-green-200 via-slate-300 to-green-400">
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthForm />} />
          {/* <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

      {/* Toaster for toast notifications */}
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
}

export default App;
