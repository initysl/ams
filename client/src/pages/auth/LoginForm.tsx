import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOff } from "lucide-react";
import { AdaptiveInput } from "@/components/app-ui/adaptive-input";

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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <AdaptiveInput
            label="Email Address"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...field}
          />
        )}
      />

      <div className="relative">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AdaptiveInput
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              error={errors.password?.message}
              {...field}
            />
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500  hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

      <div className="text-right text-sm">
        <Link to="/recover" className="text-blue-600 hover:underline">
          Forgot Password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
