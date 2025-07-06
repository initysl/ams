import { useState, useEffect } from "react";
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
import { FieldErrors, useForm, Controller } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import {
  EyeIcon,
  EyeOff,
  Loader,
  XCircle,
  Shield,
  ArrowLeft,
  Clock,
  Lock,
} from "lucide-react";
import { AdaptiveInput } from "@/components/app-ui/adaptive-input";

// Enhanced password validation schema
const resetPassSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPassForm = z.infer<typeof resetPassSchema>;

const ResetPass: React.FC = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ResetPassForm>({
    resolver: zodResolver(resetPassSchema),
  });

  const resetPassErrors = errors as FieldErrors<ResetPassForm>;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Check token validity on component mount
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setTokenError("Reset link is invalid or missing");
      setIsValidating(false);
      return;
    }

    // Validate token with API call
    const validateToken = async () => {
      try {
        const response = await api.post(
          "auth/validate",
          { token },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.valid) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setTokenError("Invalid reset token");
        }
      } catch (error) {
        const errorResponse = (error as any)?.response;
        const errorCode = errorResponse?.data?.code;

        if (errorCode === "TOKEN_EXPIRED") {
          setIsExpired(true);
        } else if (errorCode === "INVALID_TOKEN") {
          setIsTokenValid(false);
          setTokenError("Invalid reset token");
        } else {
          setIsTokenValid(false);
          setTokenError("Unable to validate reset link");
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const resetPassMutation = useMutation({
    mutationFn: async (data: ResetPassForm) => {
      if (!token) {
        throw new Error("Token is missing");
      }
      const response = await api.post(
        "auth/reset",
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
      toast.success(data.message || "Password reset successfully!");
      navigate("/auth");
    },
    onError: (error) => {
      const errorResponse = (error as any)?.response;
      const errorMessage = errorResponse?.data?.message;
      const errorCode = errorResponse?.data?.code;

      // Handle token expiration
      if (errorCode === "TOKEN_EXPIRED") {
        setIsExpired(true);
        toast.error("Reset link has expired. Please request a new one.");
        return;
      }

      // Handle invalid token
      if (errorCode === "INVALID_TOKEN") {
        setIsTokenValid(false);
        setTokenError("Invalid reset link");
        toast.error("Invalid reset link");
        return;
      }

      toast.error(errorMessage || "An error occurred");
    },
  });

  const onSubmit = (data: ResetPassForm) => {
    resetPassMutation.mutate(data);
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-svh p-3">
        <Card className="w-full max-w-md p-6 rounded-xl bg-white shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>

            <CardTitle className="text-2xl text-gray-900">
              Validating Reset Link
            </CardTitle>

            <CardDescription className="text-gray-600">
              Please wait while we verify your reset link...
            </CardDescription>
          </div>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (isTokenValid === false) {
    return (
      <div className="flex justify-center items-center min-h-svh p-3">
        <Card className="w-full max-w-md p-6 rounded-xl bg-white shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <CardTitle className="text-2xl text-gray-900">
              Invalid Reset Link
            </CardTitle>

            <CardDescription className="text-gray-600">
              {tokenError || "Link invalid."}
            </CardDescription>

            <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800">
              <p className="font-medium">What you can do:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>Request a new password reset link</li>
                <li>Make sure you're using the correct email</li>
              </ul>
            </div>

            <div className="space-y-5">
              <div>
                <Link to="/auth/recover">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Request New Reset Link
                  </Button>
                </Link>
              </div>

              <div>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Expired token state
  if (isExpired) {
    return (
      <div className="flex justify-center items-center min-h-svh p-3">
        <Card className="w-full max-w-md p-6 rounded-xl bg-white shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>

            <CardTitle className="text-2xl text-gray-900">
              Link Expired
            </CardTitle>

            <CardDescription className="text-gray-600">
              This reset link has expired. Reset links are only valid for 5
              minutes.
            </CardDescription>

            <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-800">
              <p className="font-medium">Security Note:</p>
              <p className="text-xs mt-1">
                Reset links expire quickly to protect your account from
                unauthorized access.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <Link to="/auth/recover">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Request New
                  </Button>
                </Link>
              </div>

              <div>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="flex justify-center items-center min-h-svh p-3">
      <Card className="w-full max-w-md p-6 rounded-xl bg-white shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-green-600" />
          </div>

          <CardTitle className="text-2xl text-gray-900 mb-2">
            Reset Your Password
          </CardTitle>

          <CardDescription className="text-gray-600">
            Enter a strong new password for your account
          </CardDescription>
        </div>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Field */}
            <div>
              <div className="relative">
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => (
                    <AdaptiveInput
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      label="New Password"
                      autoComplete="new-password"
                      className={`w-full pr-12 ${
                        resetPassErrors.newPassword
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>

              {resetPassErrors.newPassword && (
                <p className="text-red-500 text-sm flex items-center">
                  <XCircle size={16} className="mr-1" />
                  {resetPassErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="relative">
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <AdaptiveInput
                      {...field}
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      autoComplete="new-password"
                      className={`w-full pr-12 ${
                        resetPassErrors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>

              {resetPassErrors.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center">
                  <XCircle size={16} className="mr-1" />
                  {resetPassErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 shadow-sm"
              disabled={resetPassMutation.isPending}
            >
              {resetPassMutation.isPending ? (
                <>
                  Resetting Password...
                  <Loader className="h-4 w-4 animate-spin ml-2" />
                </>
              ) : (
                <>Reset Password</>
              )}
            </Button>
          </form>
        </CardContent>

        <div className="mt-6 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResetPass;
