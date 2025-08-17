import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Profilebox from "@/components/ui/Profilebox";
import DeleteProfile from "@/pages/dashboard/Settings/DeleteProfile";
import { AdaptiveInput } from "@/components/app-ui/adaptive-input";

// Dynamic schema based on user role
const createProfileSchema = (userRole: string | undefined) => {
  const baseSchema = {
    name: z.string().min(5, "Name must be at least 5 characters"),
    email: z.string().email("Please enter a valid email address"),
    department: z.string().min(3, "Department must be at least 3 characters"),
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
          message: "Invalid format. Use format: 2021/12345",
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
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfilePicture(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    mode: "onChange", // Validate on change for better UX
  });

  // Custom dirty state that considers both form changes and profile picture changes
  const hasUnsavedChanges = isDirty || profilePicture !== null;

  // Function to get image URL with cache busting
  const getImageUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return "";

    // For Cloudinary URLs, return as-is (they handle caching internally)
    if (profilePicture.startsWith("http")) {
      return profilePicture;
    }

    // Fallback for any legacy local files
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api/", "");
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
      // Handle validation errors array from backend
      let message = "Profile update failed. Please try again.";

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
    <div className="p-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center ">
          <Profilebox
            key={previewURL} // Force re-render when preview URL changes
            profilePicture={previewURL}
            onImageChange={handleImageChange}
          />
          <div className="text-center">
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Name */}
          <div className="space-y-1">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AdaptiveInput
                  {...field}
                  label="Name"
                  id="name"
                  type="text"
                  autoComplete="name"
                  error={errors.name?.message}
                  className="w-full"
                />
              )}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <AdaptiveInput
                  {...field}
                  label="Email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  className="w-full"
                />
              )}
            />
            <p className="text-xs text-amber-600 flex items-center gap-1">
              Changing your email will require verification
            </p>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <AdaptiveInput
                  {...field}
                  label="Department"
                  id="department"
                  type="text"
                  autoComplete="organization"
                  error={errors.department?.message}
                  className="w-full"
                />
              )}
            />
          </div>

          {/* Matric Number (Only for students) */}
          {user?.role === "student" && (
            <div className="space-y-1">
              <Controller
                name="matricNumber"
                control={control}
                render={({ field }) => (
                  <AdaptiveInput
                    {...field}
                    label="Matric Number"
                    id="matricNumber"
                    type="text"
                    autoComplete="off"
                    error={errors.matricNumber?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1 lg:col-span-2">
            <div className="relative">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <AdaptiveInput
                    {...field}
                    label="New Password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    error={errors.password?.message}
                    className="w-full pr-10"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Leave blank to keep current password
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={
              updateMutation.isPending || isSubmitting || !hasUnsavedChanges
            }
            className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateMutation.isPending || isSubmitting ? (
              <>
                Saving Changes...
                <Loader className="animate-spin h-4 w-4" />
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          <DeleteProfile />
        </div>

        {/* Dirty state indicator */}
        {hasUnsavedChanges && (
          <div className="text-center">
            <p className="text-sm text-amber-600 font-medium">
              You have unsaved changes
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
