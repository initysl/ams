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
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="bg-slate-200 p-6 rounded-lg shadow-lg max-w-3xl relative">
        <h2 className="text-xl font-bold mb-4">
          {isSignIn ? "Sign In" : "Register"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignIn ? (
            <>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter your email address"
                />
                {loginErrors.email && (
                  <p className="text-red-500">{loginErrors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Password"
                />
                {loginErrors.password && (
                  <p className="text-red-500">{loginErrors.password.message}</p>
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  autoComplete="name"
                  {...register("name")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Full name"
                />
                {registerErrors.name && (
                  <p className="text-red-500">{registerErrors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                />
                {registerErrors.email && (
                  <p className="text-red-500">{registerErrors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  autoComplete="organization"
                  {...register("department")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Department"
                />
                {registerErrors.department && (
                  <p className="text-red-500">
                    {registerErrors.department.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="matricNo">Matric No</label>
                <input
                  id="matricNo"
                  autoComplete="username"
                  {...register("matricNo")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Matric No"
                />
                {registerErrors.matricNo && (
                  <p className="text-red-500">
                    {registerErrors.matricNo.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Password"
                />
                {registerErrors.password && (
                  <p className="text-red-500">
                    {registerErrors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="off"
                  {...register("confirmPassword")}
                  className="w-full border rounded px-3 py-2"
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

          <div className="flex justify-between items-center mt-4">
            <Button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting
                ? "Please wait..."
                : isSignIn
                ? "Sign In"
                : "Register"}
            </Button>

            <button
              onClick={() => setIsSignIn(!isSignIn)}
              type="button"
              className="text-sm text-blue-500 hover:underline"
            >
              {isSignIn ? "Register instead" : "Already have an account?"}
            </button>
          </div>
        </form>

        <div className="flex justify-end mt-4">
          <Button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
