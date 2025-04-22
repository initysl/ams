import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { EyeIcon, EyeOff } from "lucide-react";

const resetPassSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

type ResetPassForm = z.infer<typeof resetPassSchema>;

const ResetPass: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPassForm>({
    resolver: zodResolver(resetPassSchema),
  });

  const resetPassErrors = errors as FieldErrors<ResetPassForm>;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const resetPassMutation = useMutation({
    mutationFn: async (data: ResetPassForm) => {
      if (!token) {
        throw new Error("Token is missing");
      }
      const response = await api.post(
        "/auth/reset",
        { ...data, token },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/auth");
    },
    onError: (error) => {
      toast.error(
        (error as any)?.response?.data?.message || "An error occurred"
      );
    },
  });

  const onSubmit = (data: ResetPassForm) => {
    resetPassMutation.mutate(data);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <CardTitle className="text-2xl text-center">
          <h1>Reset password</h1>
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg text-center">
          <p>Enter your new password</p>
        </CardDescription>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-10"
          >
            <div className="space-y-8">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="on"
                  {...register("password")}
                  placeholder="Enter new password"
                  className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-500"
                >
                  {showPassword ? <EyeOff /> : <EyeIcon />}
                </button>
                {resetPassErrors.password && (
                  <p className="text-red-500 text-sm">
                    {resetPassErrors.password.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="off"
                  {...register("confirmPassword")}
                  placeholder="Confirm new password"
                  className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff /> : <EyeIcon />}
                </button>
                {resetPassErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {resetPassErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              {resetPassErrors.root?.message && (
                <p className="text-red-500 text-sm">
                  {resetPassErrors.root.message}
                </p>
              )}
            </div>
            <Button
              className="bg-stone-500 hover:bg-stone-700 text-white hover:shadow-3xl hover:ease-in-out cursor-pointer"
              disabled={resetPassMutation.isPending}
            >
              {resetPassMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPass;
