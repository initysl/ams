// QRCodeAttendanceGenerator.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";

// Define form schema with Zod
const formSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required"),
  courseCode: z.string().min(1, "Course code is required"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
});

const GenerateQRPage = () => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-xl font-bold text-center mb-6">
        Generate QR Code for Attendance
      </h1>

      <p className="text-center text-sm text-gray-500 mt-4">
        Simply generate the QR CODE for the lecture
      </p>
    </div>
  );
};

export default GenerateQRPage;
