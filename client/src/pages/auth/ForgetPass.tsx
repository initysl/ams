import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader, ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react";
import { AdaptiveInput } from "@/components/app-ui/adaptive-input";
import { Link } from "react-router-dom";
import { useState } from "react";

const recoverSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type RecoverForm = z.infer<typeof recoverSchema>;

const ForgetPass: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecoverForm>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: "",
    },
  });

  const recoverMutation = useMutation({
    mutationFn: async (data: RecoverForm) => {
      const response = await api.post("auth/recover", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      setSubmittedEmail(variables.email);
      setIsSuccess(true);
      toast.success(`Reset link sent successfully! ${data}`);
      // toast.success("Reset link sent successfully!");
    },
    onError: (error) => {
      const errorMessage = (error as any)?.response?.data?.message;

      // Handle different error scenarios
      if (
        errorMessage?.includes("not found") ||
        errorMessage?.includes("does not exist")
      ) {
        toast.error("No account found with this email address");
      } else if (
        errorMessage?.includes("rate limit") ||
        errorMessage?.includes("too many")
      ) {
        toast.error("Too many attempts. Please wait before trying again");
      } else {
        toast.error(
          errorMessage || "Unable to send reset link. Please try again"
        );
      }
    },
  });

  const onSubmit = (data: RecoverForm) => {
    recoverMutation.mutate(data);
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    reset();
  };

  const resendLink = () => {
    if (submittedEmail) {
      recoverMutation.mutate({ email: submittedEmail });
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-svh p-3">
        <Card className="w-full max-w-md p-6 rounded-xl bg-white shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <CardTitle className="text-2xl text-gray-900">
              Check your email
            </CardTitle>

            <CardDescription className="text-gray-600">
              We've sent a password reset link to
              <span className="font-medium text-gray-900 block mt-1">
                {submittedEmail}
              </span>
            </CardDescription>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Didn't receive the email?</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure the email address is correct</li>
                    <li>The link will expire in 5 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={resendLink}
                variant="outline"
                className="w-full"
                disabled={recoverMutation.isPending}
              >
                {recoverMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Resend email
              </Button>

              <Button
                onClick={handleTryAgain}
                variant="ghost"
                className="w-full text-gray-600"
              >
                Try a different email
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Link
                to="/auth"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Initial form state
  return (
    <div className="flex justify-center items-center min-h-svh p-3">
      <Card className="w-full max-w-md p-6 rounded-xl bg-white shadow-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>

          <CardTitle className="text-2xl text-gray-900 mb-2">
            Reset your password
          </CardTitle>

          <CardDescription className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </div>

        <form
          id="forget-pass"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
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
                className="w-full"
                {...field}
              />
            )}
          />

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 shadow-sm"
            disabled={recoverMutation.isPending}
          >
            {recoverMutation.isPending ? (
              <>
                Sending...
                <Loader className="h-4 w-4 animate-spin ml-2" />
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send reset link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Your security is our priority
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForgetPass;
