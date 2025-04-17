import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`auth/verify-email?token=${token}`);
        if (res.data.success) {
          toast.success("Email verified successfully! You can now log in.");
        } else {
          setErrorMessage("Invalid or expired verification link.");
          setIsVerifying(false);
        }
      } catch (err) {
        setErrorMessage("Something went wrong during verification.");
        setIsVerifying(false);
      }
    };

    if (token) {
      verify();
    } else {
      toast.error("No token provided in the URL.");
      setIsVerifying(false);
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center">
      <svg
        className={`${
          isVerifying ? "animate-spin" : ""
        } h-20 w-20 text-blue-500 mb-4`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      {isVerifying ? (
        <p className="text-lg font-medium">Verifying your email....</p>
      ) : errorMessage ? (
        <p className="text-lg font-medium text-red-500">{errorMessage}</p>
      ) : (
        <p className="text-lg font-medium text-green-600">
          Email verified successfully! You can now log in.
        </p>
      )}
    </div>
  );
};

export default VerifyEmail;
