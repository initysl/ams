import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader, CheckCircle, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VerificationState {
  isVerifying: boolean;
  success: boolean;
  error: boolean;
  errorMessage: string | null;
  countdown: number;
  canResend: boolean;
}

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerificationState>({
    isVerifying: true,
    success: false,
    error: false,
    errorMessage: null,
    countdown: 0,
    canResend: true,
  });

  // const [resendLoading, setResendLoading] = useState(false);

  // Auto-redirect countdown
  useEffect(() => {
    if (state.success && state.countdown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.success && state.countdown === 0) {
      navigate("/auth");
    }
  }, [state.success, state.countdown, navigate]);

  // Email verification logic
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`auth/verify?token=${token}`);
        if (res.data.success) {
          toast.success("Email verified successfully! Redirecting to login");
          setSuccess(true);
          // Optionally open login modal after short delay
          setTimeout(() => {
            navigate("/auth");
          }, 3000);
        } else {
          throw new Error(response.data.message || "Verification failed");
        }
      } catch (error: any) {
        let errorMessage = "Something went wrong during verification.";

        if (error.response?.status === 400) {
          errorMessage = "Invalid or expired verification token.";
        } else if (error.response?.status === 404) {
          errorMessage = "Verification token not found.";
        } else if (error.response?.status === 409) {
          errorMessage = "Email is already verified.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setState((prev) => ({
          ...prev,
          isVerifying: false,
          error: true,
          errorMessage,
        }));
        toast.error("Verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  // Resend verification email
  // const handleResendEmail = async () => {
  //   try {
  //     setResendLoading(true);

  //     // You'll need to implement this endpoint or get email from token
  //     const response = await api.post("auth/resend-verification");

  //     if (response.data.success) {
  //       toast.success("Verification email sent! Please check your inbox.");
  //       setState((prev) => ({ ...prev, canResend: false }));

  //       // Re-enable resend after 60 seconds
  //       setTimeout(() => {
  //         setState((prev) => ({ ...prev, canResend: true }));
  //       }, 60000);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to resend verification email");
  //   } finally {
  //     setResendLoading(false);
  //   }
  // };

  // Verification in progress
  if (state.isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {/* Animated loader */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 border-2 border-blue-200 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Verifying Your Email
                </h1>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure verification in progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (state.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {/* Success icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Email Verified Successfully!
                </h1>
                <p className="text-gray-600">
                  Your email has been verified. You can now access your account.
                </p>
              </div>

              {/* Auto-redirect countdown */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium">
                  Redirecting to login in {state.countdown} seconds...
                </p>
                <div className="mt-2 bg-green-200 rounded-full h-1">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${((5 - state.countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  Continue to Login
                </Button>

                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {/* Error icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Verification Failed
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {state.errorMessage}
                </p>
              </div>

              {/* Error details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  What can you do?
                </h3>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Check if the link in your email is complete</li>
                  <li>Try copying and pasting the entire URL</li>
                  <li>Request a new verification email</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>

              {/* Action buttons
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={!state.canResend || resendLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {state.canResend
                        ? "Resend Verification Email"
                        : "Email Sent"}
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>

                  <Button
                    onClick={() => navigate("/support")}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Get Help
                  </Button>
                </div>
              </div> */}

              {/* Additional help
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Still having trouble?{" "}
                  <Link
                    to="/support"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Contact our support team
                  </Link>
                </p>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;
