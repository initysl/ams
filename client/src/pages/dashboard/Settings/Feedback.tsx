import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

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

  const onSubmit = (data: FeedbackFormInputs) => {
    console.log("Feedback submitted:", data);
    alert("Thank you for your feedback!");
    reset(); // Clear the form
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

        <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Submit Feedback
        </Button>
      </form>
    </div>
  );
};

export default Feedback;
