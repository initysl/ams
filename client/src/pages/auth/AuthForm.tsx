import React, { useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner"; // for user feedback
import { Button } from "../../components/ui/button";
import Profilebox from "@/components/ui/Profilebox";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

const registerSchema = z
  .object({
    name: z.string().min(5, "Name is required"),
    email: z.string().email("Invalid email"),
    department: z.string().min(3, "Department is required"),
    matricNumber: z
      .string()
      .min(10, "Matric number must be at least 10 characters")
      .or(z.literal("").optional()),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    profilePic: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

const AuthForm: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  const [profilePic, setProfilePic] = useState<File | null>(null);

  const [previewURL, setPreviewURL] = useState<string>("");
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFields | RegisterFields>({
    resolver: zodResolver(isSignIn ? loginSchema : registerSchema),
  });

  const loginErrors = errors as FieldErrors<LoginFields>;
  const registerErrors = errors as FieldErrors<RegisterFields>;

  // === Login Mutation ===

  const loginMutation = useMutation({
    mutationFn: (data: LoginFields) => api.post("/auth/login", data),
    onSuccess: (res) => {
      toast.success(`Signed in successfully: ${res.data.message}`);
      reset();
    },
    onError: (err: any) => {
      toast.error(
        `Sign in failed: ${err.response?.data?.message || "Unknown error"}`
      );
    },
  });

  // === Register Mutation ===
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFields) => {
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

      return api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`Registered successfully: ${res.data.message}`);
      reset();
      setProfilePic(null);
      setPreviewURL("");
    },
    onError: (err: any) => {
      toast.error(
        `Registration failed: ${err.response?.data?.message || "Unknown error"}`
      );
    },
  });

  const onSubmit: SubmitHandler<LoginFields | RegisterFields> = async (
    data
  ) => {
    if (isSignIn) {
      loginMutation.mutate(data as LoginFields);
    } else {
      registerMutation.mutate(data as RegisterFields);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          <div className="flex justify-between items-center">
            {isSignIn ? "Sign In" : "Register"}
            {!isSignIn && (
              <Profilebox
                profilePic={
                  previewURL ||
                  `${import.meta.env.VITE_API_URL}images/default.png`
                }
                onImageChange={handleImageChange}
              />
            )}
          </div>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isSignIn ? (
            <>
              <div>
                <input
                  id="email"
                  type="email"
                  autoComplete="on"
                  {...register("email")}
                  placeholder="Email address"
                  className="w-full p-2 bg-gray-100 rounded-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
                {loginErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="on"
                  {...register("password")}
                  placeholder="Password"
                  className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-500"
                >
                  {showPassword ? <EyeOff /> : <EyeIcon />}
                </button>
                {loginErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  {...register("remember")}
                  className="accent-green-600"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <div className="text-right">
                <Link to="/recover" className="text-blue-500 hover:underline">
                  Forgotten Password?
                </Link>
              </div>
            </>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    id="name"
                    autoComplete="on"
                    {...register("name")}
                    placeholder="Full Name"
                    className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                  {registerErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerErrors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="on"
                    {...register("email")}
                    placeholder="Email"
                    className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                  {registerErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerErrors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    id="department"
                    autoComplete="on"
                    {...register("department")}
                    placeholder="Department"
                    className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                  {registerErrors.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerErrors.department.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    id="matricNumber"
                    autoComplete="on"
                    {...register("matricNumber")}
                    placeholder="Matric Number (2021/36000)"
                    className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                  {registerErrors.matricNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerErrors.matricNumber.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="on"
                    {...register("password")}
                    placeholder="Password"
                    className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showPassword ? <EyeOff /> : <EyeIcon />}
                  </button>
                  {registerErrors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerErrors.password.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="off"
                    {...register("confirmPassword")}
                    placeholder="Confirm Password"
                    className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff /> : <EyeIcon />}
                  </button>
                  {registerErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center mt-8 space-y-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending
                ? "Please wait..."
                : isSignIn
                ? "Sign In"
                : "Register"}
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
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
