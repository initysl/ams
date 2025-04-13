import React, { useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    name: z.string().min(5, "Name is required"),
    email: z.string().email("Invalid email"),
    department: z.string().min(3, "Department is required"),
    matricNo: z
      .string()
      .min(10, "Matric number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

const AuthForm: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFields | RegisterFields>({
    resolver: zodResolver(isSignIn ? loginSchema : registerSchema),
  });

  const loginErrors = errors as FieldErrors<LoginFields>;
  const registerErrors = errors as FieldErrors<RegisterFields>;

  const onSubmit: SubmitHandler<LoginFields | RegisterFields> = async (
    data
  ) => {
    try {
      if (isSignIn) {
        alert("Signed in successfully");
        reset();
      } else {
        alert("Registered successfully");
        reset();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-svh bg-gradient-to-br from-green-100 via-white to-green-200 p-2">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl transition-all duration-500">
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
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-left">
          {isSignIn ? "Sign In" : "Register"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isSignIn ? (
            <>
              <div>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Email address"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {loginErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Password"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {loginErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="accent-green-600"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  id="name"
                  {...register("name")}
                  placeholder="Full Name"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
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
                  {...register("email")}
                  placeholder="Email"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
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
                  {...register("department")}
                  placeholder="Department"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {registerErrors.department && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerErrors.department.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  id="matricNo"
                  {...register("matricNo")}
                  placeholder="Matric Number"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {registerErrors.matricNo && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerErrors.matricNo.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Password"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {registerErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerErrors.password.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm Password"
                  className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {registerErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center mt-8 space-y-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg "
            >
              {isSubmitting
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
