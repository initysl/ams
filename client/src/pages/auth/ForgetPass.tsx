import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const recoverSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type RecoverForm = z.infer<typeof recoverSchema>;

const ForgetPass: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverForm>({
    resolver: zodResolver(recoverSchema),
  });

  const recoverErrors = errors as FieldErrors<RecoverForm>;

  const recoverMutation = useMutation({
    mutationFn: async (data: RecoverForm) => {
      const response = await api.post("/auth/recover", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(
        (error as any)?.response?.data?.message || "An error occurred"
      );
    },
  });

  const onSubmit = (data: RecoverForm) => {
    recoverMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <CardTitle className="text-2xl">
          <h1>Forgot Password</h1>
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg">
          <p>Enter your email address to receive a password reset link.</p>
        </CardDescription>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 flex flex-col items-center justify-center"
        >
          <input
            id="email"
            type="email"
            autoComplete="on"
            {...register("email")}
            placeholder="Email"
            className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
          />
          {recoverErrors.email && (
            <p className="text-red-500 text-sm mt-1">
              {recoverErrors.email.message}
            </p>
          )}
          <Button
            className="bg-stone-500 hover:bg-stone-700 text-white hover:shadow-3xl hover:ease-in-out cursor-pointer "
            disabled={recoverMutation.isPending}
          >
            {recoverMutation.isPending ? "Sending..." : "Request link"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ForgetPass;
