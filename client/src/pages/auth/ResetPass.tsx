import api from "@/lib/axios";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPass: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="reset-pass-container">
      <h1>Reset Password</h1>
      {success ? (
        <p>
          Your password has been reset successfully. Redirecting to login...
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPass;
