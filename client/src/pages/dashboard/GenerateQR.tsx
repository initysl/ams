import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import api from "@/lib/axios";

const qrSchema = z.object({
  courseTitle: z.string().min(5, "Course title is required"),
  courseCode: z.string().min(3, "Course code is required"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
});

type QRData = z.infer<typeof qrSchema>;

export default function GenerateQRPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QRData>({
    resolver: zodResolver(qrSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: QRData) => {
      const res = await api.post("attendance/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });
      if (res.status !== 200) throw new Error("Failed to generate QR code");
      return res.data;
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      const duration = parseInt(data.duration); // e.g. 30 (mins)
      setExpiresIn(duration * 60); // convert to seconds
      toast.success("QR Code generated successfully");
      reset();
    },
    onError: () => toast.error("Something went wrong"),
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (expiresIn && expiresIn > 0) {
      timer = setInterval(() => {
        setExpiresIn((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    }
    if (expiresIn === 0) setQrCodeUrl(null);
    return () => clearInterval(timer);
  }, [expiresIn]);

  const onSubmit = (data: QRData) => mutate(data);

  const { user } = useAuth();

  return (
    <>
      <h1 className="text-2xl text-center text-pretty font-bold mb-6">
        Generate QR Code for Attendance
      </h1>
      <div className="max-w-3xl mx-auto mt-10 p-4 rounded-xl bg-white shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-2">
            <Label>Course Title</Label>
            <Input
              placeholder="INTRODUCTION TO PYTHON"
              {...register("courseTitle")}
              className=""
            />
            {errors.courseTitle && (
              <p className="text-red-500 text-sm">
                {errors.courseTitle.message}
              </p>
            )}
          </div>
          <div className="flex jstc gap-4 space-y-2">
            <div className="flex-1 space-y-2">
              <Label>Course Code</Label>
              <Input placeholder="CSC 309" {...register("courseCode")} />
              {errors.courseCode && (
                <p className="text-red-500 text-sm">
                  {errors.courseCode.message}
                </p>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Level</Label>
              <Input placeholder="400" {...register("level")} />
              {errors.level && (
                <p className="text-red-500 text-sm">{errors.level.message}</p>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Duration</Label>
              <Input placeholder="30 mins" {...register("duration")} />
              {errors.duration && (
                <p className="text-red-500 text-sm">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <Card className="p-10 mt-6 flex flex-col items-center justify-center border-dashed border-2 border-gray-300">
            {qrCodeUrl ? (
              <>
                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                {expiresIn !== null && (
                  <p className="mt-2 text-sm text-gray-500">
                    Expires in: {Math.floor(expiresIn / 60)}m {expiresIn % 60}s
                  </p>
                )}
              </>
            ) : (
              <div className="text-gray-500">QR Code not processed yet</div>
            )}
          </Card>

          <div className="flex justify-center gap-6 mt-6">
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white px-6 flex items-center gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Generate"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="px-6 bg-red-500"
              onClick={() => reset()}
            >
              Cancel
            </Button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-3">
            Simply generate the QR CODE for the lecture
          </p>
        </form>
      </div>
    </>
  );
}
