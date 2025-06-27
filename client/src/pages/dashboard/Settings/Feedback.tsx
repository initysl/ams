import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

type FeedbackFormInputs = {
  category: string;
  message: string;
  email: string;
};

const Feedback = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormInputs>();

  const { user } = useAuth();

  // Auto-populate email when component mounts or user changes
  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FeedbackFormInputs) => {
      const res = await api.post("user/feedback", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      reset();
      // Re-populate email after reset
      if (user?.email) {
        setValue("email", user.email);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to submit feedback: ${error}`);
      // console.error(error);
    },
  });

  const onSubmit = (data: FeedbackFormInputs) => {
    mutate(data);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Send Feedback</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            autoComplete="off"
            {...register("category", { required: "Please select a category" })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a category</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="general">General Feedback</option>
            <option value="other">Other</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Your Message
          </label>
          <textarea
            id="message"
            autoComplete="off"
            {...register("message", {
              required: "Message is required",
              minLength: {
                value: 10,
                message: "Minimum 10 characters required",
              },
            })}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Please describe your feedback in detail..."
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Email - Auto-populated and read-only */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email", { required: "Email is required" })}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            placeholder="Your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </form>
    </div>
  );
};

export default Feedback;
