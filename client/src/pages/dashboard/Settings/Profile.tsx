import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Profilebox from "@/components/ui/Profilebox";

const profileSchema = z.object({
  name: z.string().min(5, "Name is required"),
  email: z.string().email("Invalid email format"),
  department: z.string().min(3, "Department is required"),
  matricNumber: z
    .string()
    .min(10)
    .regex(/^\d{4}\/\d+$/, { message: "Invalid matric number" })
    .optional(),
  password: z.string().optional(),
  profilePic: z.any().optional(),
});

type ProfileFields = z.infer<typeof profileSchema>;

const Profile = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const { user, refetchUser } = useAuth();

  const handleImageChange = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }
    setProfilePic(file);
    setPreviewURL(URL.createObjectURL(file));
  };

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
      if (user.profilePicture) setPreviewURL(user.profilePicture);
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFields) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("department", data.department);

      if (user?.role === "student" && data.matricNumber) {
        formData.append("matricNumber", data.matricNumber);
      }

      if (data.password) {
        formData.append("password", data.password);
      }

      if (profilePic) {
        formData.append("profilePicture", profilePic);
      }

      const response = await api.put("user/profile/update", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      // Handle success response based on backend response structure
      if (data.success) {
        toast.success(data.message || "Profile updated successfully!");

        // If email verification is required, show additional message
        if (data.message?.includes("verification")) {
          toast.info(
            "Please check your email to verify the new email address."
          );
        }

        refetchUser();
      } else {
        toast.error(data.message || "Profile update failed.");
      }
    },
    onError: (error: any) => {
      // Handle error response based on backend error structure
      let message = "Profile update failed.";

      if (error?.response?.data) {
        const errorData = error.response.data;

        if (errorData.message) {
          message = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors
          message = errorData.errors
            .map((err: any) => err.msg || err.message)
            .join(", ");
        }
      }

      toast.error(message);
    },
  });

  const onSubmit = (data: ProfileFields) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Update Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-fit">
          <Profilebox
            profilePic={previewURL}
            onImageChange={handleImageChange}
          />
        </div>

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
              className="text-ellipsis"
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

          <div className="space-y-6">
            {/* Matric Number (Only for students) */}
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
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <Input
              type="password"
              className="text-ellipsis"
              {...register("password")}
              placeholder="Leave blank to keep current password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {updateMutation.isPending ? (
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
