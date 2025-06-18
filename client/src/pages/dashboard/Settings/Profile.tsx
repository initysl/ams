import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Profilebox from "@/components/ui/Profilebox";
import DeleteProfile from "@/pages/dashboard/Settings/DeleteProfile";

// Create dynamic schema based on user role
const createProfileSchema = (userRole: string | undefined) => {
  const baseSchema = {
    name: z.string().min(5, "Name is required"),
    email: z.string().email("Invalid email format"),
    department: z.string().min(3, "Department is required"),
    password: z.string().optional(),
  };

  // Only add matricNumber validation for students
  if (userRole === "student") {
    return z.object({
      ...baseSchema,
      matricNumber: z
        .string()
        .min(10, "Matric number must be at least 10 characters")
        .regex(/^\d{4}\/\d+$/, {
          message: "Invalid matric number format (e.g., 2021/12345)",
        }),
    });
  }

  // For non-students, matricNumber is optional and can be empty
  return z.object({
    ...baseSchema,
    matricNumber: z.string().optional(),
  });
};

type ProfileFields = {
  name: string;
  email: string;
  department: string;
  matricNumber?: string;
  password?: string;
};

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, refetchUser } = useAuth();

  // Create schema based on user role
  const profileSchema = createProfileSchema(user?.role);

  const handleImageChange = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }
    setProfilePicture(file);
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

  // Function to get image URL with cache busting
  const getImageUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return "";

    const baseUrl = import.meta.env.VITE_API_URL.replace("/api/", "");

    if (profilePicture.startsWith("http")) {
      return `${profilePicture}?t=${Date.now()}`;
    }

    return `${baseUrl}${profilePicture}?t=${Date.now()}`;
  };

  useEffect(() => {
    if (user) {
      const formData: ProfileFields = {
        name: user.name,
        email: user.email,
        department: user.department,
      };
      // Only include matricNumber for students
      if (user.role === "student") {
        formData.matricNumber = user.matricNumber || "";
      }
      reset(formData);
      // Set preview URL with cache busting if user has profile picture
      if (user.profilePicture) {
        setPreviewURL(getImageUrl(user.profilePicture));
      }
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFields) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("department", data.department);

      // Only append matricNumber for students and if it's provided
      if (user?.role === "student" && data.matricNumber) {
        formData.append("matricNumber", data.matricNumber);
      }

      // Only append password if it's provided and not empty
      if (data.password && data.password.trim() !== "") {
        formData.append("password", data.password);
      }

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await api.put("user/profile/update", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: async (data) => {
      // Handle different response types from backend
      if (data.message && data.message.includes("Verification email sent")) {
        toast.success(data.message);
      } else {
        toast.success("Profile updated successfully!");

        // Wait a moment for the server to process the image
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Always refetch user data to get the latest profile info
        await refetchUser();

        // Clear the local profile picture state since we now have the updated user data
        setProfilePicture(null);

        // Force update preview URL with new cache busting parameter
        if (user?.profilePicture) {
          setPreviewURL(getImageUrl(user.profilePicture));
        }
      }
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      // Handle validation errors array from backend
      let message = "Profile update failed.";

      if (error?.response?.data?.message) {
        const errorData = error.response.data.message;

        // If it's an array of validation errors
        if (Array.isArray(errorData)) {
          message = errorData
            .map((err: any) => err.msg || err.message || err)
            .join(", ");
        } else {
          message = errorData;
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
            key={previewURL} // Force re-render when preview URL changes
            profilePicture={previewURL}
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
            <p className="text-xs text-gray-500 mt-1">
              Changing email will require verification
            </p>
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="text-ellipsis"
                {...register("password")}
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showPassword ? <EyeOff /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be different from current password
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
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

          <DeleteProfile />
        </div>
      </form>
    </div>
  );
};

export default Profile;
