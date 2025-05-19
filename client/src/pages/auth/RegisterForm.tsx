import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import Profilebox from "@/components/ui/Profilebox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

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
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });
  true;
  return (
    <form id="register-form" onSubmit={handleSubmit(onSubmit)} autoFocus={true}>
      <div className="mb-4 w-fit ">
        <Profilebox profilePic={previewURL} onImageChange={onImageChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="name"
            autoComplete="name"
            {...register("name")}
            placeholder="Full Name"
            className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        {/* <div>
          <Select autoComplete="sex">
            <SelectTrigger className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
        <div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="Email"
            className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            id="department"
            autoComplete="organization"
            {...register("department")}
            placeholder="Department"
            className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
          />
          {errors.department && (
            <p className="text-red-500 text-sm mt-1">
              {errors.department.message}
            </p>
          )}
        </div>
        <div>
          <Input
            id="matricNumber"
            autoComplete="on"
            {...register("matricNumber")}
            placeholder="Matric No for students. e.g 2021/36000 "
            className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
          />
          {errors.matricNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.matricNumber.message}
            </p>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
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
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
