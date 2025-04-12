import React, { useState } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

// Zod schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    name: z.string().min(5, "Name is required"),
    email: z.string().email("Invalid email"),
    department: z.string().min(3, "Department is required"),
    matricNo: z.string().min(10, "Matric number must be at leas 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

// type Props = {
//   onClose: () => void;
// };

const AuthForm: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields | RegisterFields>({
    resolver: zodResolver(isSignIn ? loginSchema : registerSchema),
  });

  // Narrowed errors
  const loginErrors = errors as FieldErrors<LoginFields>;
  const registerErrors = errors as FieldErrors<RegisterFields>;

  const onSubmit: SubmitHandler<LoginFields | RegisterFields> = async (
    data
  ) => {
    try {
      if (isSignIn) {
        alert("Siggned in successfully");
      } else {
        console.log("Register Data:", data);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-svh ">
      <div className="bg-white p-5 rounded-2xl shadow-2xl ">
        <div className="flex flex-col space-y-3 items-center justify-center mb-10 text-pretty text-center">
          <h1 className="text-3xl font-bold">
            Welcome to <span className="text-green-600">AttenEase</span>
          </h1>
          <p>Login or sign up below to manage your attendance activities </p>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          {isSignIn ? "Sign In" : "Register"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignIn ? (
            <>
              <div>
                <label htmlFor="email" className="text-xl">
                  Email
                </label>
                <input
                  id="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Enter your email address"
                />
                {loginErrors.email && (
                  <p className="text-red-500">{loginErrors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="text-xl">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full order-none rounded-md bg-stone-300 p-3"
                  placeholder="Password"
                />
                {loginErrors.password && (
                  <p className="text-red-500">{loginErrors.password.message}</p>
                )}
              </div>

              <div className="space-x-2 flex">
                <input type="checkbox" name="remember-me" id="remember-me" />
                <label htmlFor="remember-me" className="text-gray text-sm">
                  Remember me
                </label>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-1">
                <label htmlFor="name" className="text-xl">
                  Name
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  {...register("name")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Full name"
                />
                {registerErrors.name && (
                  <p className="text-red-500">{registerErrors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="text-xl">
                  Email
                </label>
                <input
                  id="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Email"
                />
                {registerErrors.email && (
                  <p className="text-red-500">{registerErrors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="department" className="text-xl">
                  Department
                </label>
                <input
                  id="department"
                  autoComplete="organization"
                  {...register("department")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Department"
                />
                {registerErrors.department && (
                  <p className="text-red-500">
                    {registerErrors.department.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="matricNo" className="text-xl">
                  Matric No
                </label>
                <input
                  id="matricNo"
                  autoComplete="username"
                  {...register("matricNo")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Matric No"
                />
                {registerErrors.matricNo && (
                  <p className="text-red-500">
                    {registerErrors.matricNo.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="text-xl">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Password"
                />
                {registerErrors.password && (
                  <p className="text-red-500">
                    {registerErrors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-xl text-ellipsis"
                >
                  Confirm Pass
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="off"
                  {...register("confirmPassword")}
                  className="w-full border-none rounded-md bg-stone-300 p-3"
                  placeholder="Confirm Password"
                />
                {registerErrors.confirmPassword && (
                  <p className="text-red-500">
                    {registerErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col justify-between items-center space-y-5 mt-10">
            <div>
              <Button
                type="submit"
                className="bg-green-600 text-white text-xl w-50"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isSignIn
                  ? "Sign In"
                  : "Register"}
              </Button>
            </div>
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              type="button"
              className="text-sm text-gray hover:underline"
            >
              {isSignIn
                ? "Don't have an account yet, Sign up"
                : "Already have an account?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
