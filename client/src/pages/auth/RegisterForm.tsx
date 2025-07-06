import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOff } from "lucide-react";
import Profilebox from "@/components/ui/Profilebox";
import { AdaptiveInput } from "@/components/app-ui/adaptive-input";

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
    profilePicture: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFields) => void;
  isPending: boolean;
  previewURL: string;
  onImageChange: (file: File) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  previewURL,
  onImageChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      matricNumber: "",
      password: "",
      confirmPassword: "",
      profilePicture: null,
    },
  });

  return (
    <form
      id="register-form"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="on"
    >
      <div className="mb-4 w-fit">
        <Profilebox profilePicture={previewURL} onImageChange={onImageChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <AdaptiveInput
              label="Full Name"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...field}
            />
          )}
        />

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

        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <AdaptiveInput
              label="Department"
              type="text"
              autoComplete="organization-title"
              error={errors.department?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="matricNumber"
          control={control}
          render={({ field }) => (
            <AdaptiveInput
              label="Matric Number (Optional)"
              type="text"
              autoComplete="off"
              error={errors.matricNumber?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <AdaptiveInput
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                error={errors.password?.message}
                {...field}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500  hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <AdaptiveInput
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...field}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500  hover:text-gray-700"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
          )}
        />
      </div>
    </form>
  );
};

export default RegisterForm;
