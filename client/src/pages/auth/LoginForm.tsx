import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFields) => void;
  isPending: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          placeholder="Email address"
          className="w-full p-2 bg-gray-100 rounded-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="text-right">
        <Link to="/recover" className="text-blue-500 hover:underline">
          Forgot Password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
