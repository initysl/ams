import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";

type FeedbackFormInputs = {
  category: string;
  message: string;
  email?: string;
};

const Feedback = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormInputs>();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FeedbackFormInputs) => {
      const res = await api.post("user/feedback", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      reset();
    },
    onError: (error: any) => {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(error);
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
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
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
          <label className="block text-sm font-medium mb-1">Your Message</label>
          <textarea
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

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            {...register("email", {
              pattern: {
                value: /^[^@]+@[^@]+\.[^@]+$/,
                message: "Invalid email format",
              },
            })}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Your email for follow-up"
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
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </form>
    </div>
  );
};

export default Feedback;
