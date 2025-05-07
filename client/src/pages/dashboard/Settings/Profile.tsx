import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  department: z.string().min(3, "Department is required"),
  matricNumber: z
    .string()
    .min(10)
    .regex(/^\d{4}\/\d+$/, {
      message: "Invalid matric number",
    })
    .optional(),
  password: z.string().optional(),
});

type ProfileFields = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, refetchUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        department: user.department,
        matricNumber: user.matricNumber || "",
      });
    }
  }, [user, reset]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileFields) => {
      const payload = {
        ...data,
        matricNumber: user?.role === "student" ? data.matricNumber : undefined,
      };

      const response = await api.put("user/profile/update", payload, {
        withCredentials: true,
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetchUser();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Profile update failed.";
      toast.error(message);
    },
  });

  const onSubmit = (data: ProfileFields) => {
    updateProfile(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Update Profile</h2>

      <form
        onSubmit={handleSubmit(onSubmit, () =>
          toast.error("Please fix form errors before submitting.")
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              {...register("name")}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Input
              type="text"
              {...register("department")}
              placeholder="e.g., Computer Science"
            />
            {errors.department && (
              <p className="text-red-500 text-sm">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Matric Number and Password */}
          <div className="space-y-6">
            {user?.role === "student" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Matric Number
                </label>
                <Input
                  type="text"
                  {...register("matricNumber")}
                  placeholder="e.g., 2021/12345"
                />
                {errors.matricNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.matricNumber.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Leave empty to keep current password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
