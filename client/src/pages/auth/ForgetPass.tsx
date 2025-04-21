import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";

const ForgetPass: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    if (email) {
      setMessage("Password reset link has been sent to your email.");
    } else {
      setMessage("Please enter a valid email address.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        <CardDescription className="text-gray-600  text-lg">
          Enter your email address to receive a password reset link.
        </CardDescription>
      </Card>
    </div>
  );
};

export default ForgetPass;
