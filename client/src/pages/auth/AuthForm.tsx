// AuthForm.tsx
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "../../components/ui/button";
import { Loader } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook
import { useNavigate } from "react-router-dom"; // For navigation after login

// Define interface for API error
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Define types for register data
interface RegisterData {
  name: string;
  matricNumber?: string | null;
  email: string;
  department: string;
  password: string;
  confirmPassword: string;
  profilePicture?: File | null;
}

const AuthForm: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const navigate = useNavigate();

  // Use the auth context
  const { login } = useAuth();

  // Handle image change from Profilebox
  const handleImageChange = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }
    setProfilePic(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  // === Login Mutation using AuthContext ===
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return login(credentials);
    },
    onSuccess: () => {
      toast.success("Signed in successfully!");
      // Redirect to dashboard or home page after successful login
      navigate("/dashboard/home");
    },
    onError: (err: ApiError) => {
      toast.error(
        `Sign in failed: ${
          err.response?.data?.message || "Invalid credentials"
        }`
      );
    },
  });

  // === Register Mutation ===
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("department", data.department);
      formData.append(
        "matricNumber",
        data.matricNumber?.match(/^\d{4}\/\d+$/) ? data.matricNumber : ""
      );
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      if (profilePic) {
        formData.append("profilePicture", profilePic);
      }

      return api.post("auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`Registered successfully: ${res.data.message}`);
      setProfilePic(null);
      setPreviewURL("");
      // Automatically switch to sign in form after successful registration
      setIsSignIn(true);
    },
    onError: (err: ApiError) => {
      toast.error(
        `Registration failed: ${err.response?.data?.message || "Unknown error"}`
      );
    },
  });

  const handleLoginSubmit = (data: { email: string; password: string }) => {
    loginMutation.mutate(data);
  };

  const handleRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center min-h-svh p-2">
      <div className="bg-white p-8 rounded-tr-xl rounded-bl-xl shadow-2xl w-full max-w-2xl transition-all duration-500">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Welcome to <span className="text-green-600">AttendEase</span>
          </h1>
          <p className="text-gray-500">
            {isSignIn
              ? "Sign in to manage your attendance"
              : "Create an account to get started"}
          </p>
        </div>

        <h2 className="text-2xl font-bold text-green-600 mb-6">
          {isSignIn ? "Sign In" : "Register"}
        </h2>

        {isSignIn ? (
          <LoginForm
            onSubmit={handleLoginSubmit}
            isPending={loginMutation.isPending}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegisterSubmit}
            isPending={registerMutation.isPending}
            previewURL={
              previewURL || `${import.meta.env.VITE_API_URL}images/default.png`
            }
            onImageChange={handleImageChange}
          />
        )}

        <div className="flex flex-col items-center mt-8 space-y-4">
          <Button
            type="submit"
            form={isSignIn ? "login-form" : "register-form"}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {loginMutation.isPending || registerMutation.isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : isSignIn ? (
              "Sign In"
            ) : (
              "Register"
            )}
          </Button>

          <p className="text-sm text-gray-600">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-blue-600 hover:underline ml-1"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
