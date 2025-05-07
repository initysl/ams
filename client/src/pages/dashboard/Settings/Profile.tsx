import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileFormInputs = {
  name: string;
  email: string;
  department: string;
  matricNumber: string;
  password?: string;
};

const Profile = () => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      department: "",
      matricNumber: "",
    },
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

  const onSubmit = async (data: ProfileFormInputs) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("department", data.department);
      formData.append("matricNumber", data.matricNumber);
      if (data.password) formData.append("password", data.password);

      const response = await axios.put("user/profile/update", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile updated successfully!");
      console.log("Updated profile:", response.data);
    } catch (error: any) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Update Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full p-2 border border-gray-300 rounded"
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
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^@]+@[^@]+\.[^@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full p-2 border border-gray-300 rounded"
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
              {...register("department", {
                required: "Department is required",
              })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., Computer Science"
            />
            {errors.department && (
              <p className="text-red-500 text-sm">
                {errors.department.message}
              </p>
            )}
          </div>

          {user?.role === "student" ? (
            // Student: Show Matric Number field
            <div>
              <label className="block text-sm font-medium mb-1">
                Matric Number
              </label>
              <Input
                type="text"
                {...register("matricNumber", {
                  required: "Matric number is required",
                  pattern: {
                    value: /^[A-Za-z0-9/]+$/,
                    message: "Only letters, numbers and '/' allowed",
                  },
                })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., 2021/12345"
              />
              {errors.matricNumber && (
                <p className="text-red-500 text-sm">
                  {errors.matricNumber.message}
                </p>
              )}
            </div>
          ) : (
            // Lecturer: Show Password field
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <Input
                type="password"
                {...register("password")}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Leave empty to keep current password"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? <Loader /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
