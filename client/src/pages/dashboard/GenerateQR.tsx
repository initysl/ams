import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const qrSchema = z.object({
  courseTitle: z.string().min(5, "Course title is required"),
  courseCode: z.string().min(5, "Course code is required"),
  courseLevel: z.enum(["100", "200", "300", "400", "500"], {
    required_error: "Course level is required",
  }),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(60, "Duration must be at most 60 minutes"),
});

type GenerateFields = z.infer<typeof qrSchema>;

const GenerateQR = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GenerateFields>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      courseTitle: "",
      courseCode: "",
      courseLevel: "400",
      duration: 20,
    },
  });

  const handleGenerateQR = async (data: GenerateFields) => {
    setIsGenerating(true);
    try {
      const response = await api.post("attendance/generate", data, {
        withCredentials: true,
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setQrGenerated(true);
    } catch (error) {
      toast.error("Error generating QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    setQrGenerated(false);
    setQrCodeUrl("");
    reset(); // Reset form to default values
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "qr_code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR Code</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 100%; max-height: 100%;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const QRPlaceholder = ({ generated = false }) => (
    <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-64 border border-gray-200 mb-6">
      {generated ? (
        <img
          src={qrCodeUrl}
          alt="Generated QR Code"
          className="w-32 h-32 mb-4"
        />
      ) : (
        <div className="w-20 h-20 mb-4 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-4 h-4 bg-gray-800 rounded-sm"></div>
            <div className="w-4 h-4 bg-white border border-gray-800 rounded-sm"></div>
            <div className="w-4 h-4 bg-white border border-gray-800 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-800 rounded-sm"></div>
          </div>
        </div>
      )}
      <p className="text-gray-500 text-sm text-center">
        {generated ? "QR Code has been generated" : "QR Code not processed yet"}
      </p>
    </div>
  );

  // Show success state after QR is generated
  if (qrGenerated) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent>
            <QRPlaceholder generated={true} />
            <div className="flex gap-4">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-md font-medium transition-colors"
              >
                Download QR Code
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-md font-medium transition-colors"
              >
                Print QR Code
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 h-12 rounded-md font-medium transition-colors"
              >
                Generate New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(handleGenerateQR)} className="space-y-6">
        <Card className="bg-white p-5">
          <CardDescription>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  type="text"
                  placeholder="Enter course title"
                  {...register("courseTitle")}
                />
                {errors.courseTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.courseTitle.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    type="text"
                    placeholder="Enter course code"
                    {...register("courseCode")}
                  />
                  {errors.courseCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.courseCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseLevel">Course Level</Label>
                  <Controller
                    name="courseLevel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full bg-gray-100 border border-gray-300 rounded-md">
                          <SelectValue placeholder="Choose level" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300 rounded-md">
                          <SelectGroup>
                            {["100", "200", "300", "400", "500"].map(
                              (level) => (
                                <SelectItem
                                  key={level}
                                  value={level}
                                  className="hover:bg-gray-200"
                                >
                                  {level}
                                </SelectItem>
                              )
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.courseLevel && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.courseLevel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={60}
                    placeholder="20"
                    {...register("duration", { valueAsNumber: true })}
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.duration.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardDescription>
        </Card>

        <Card>
          <CardContent>
            <QRPlaceholder />
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-md font-medium transition-colors"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 h-12 rounded-md font-medium transition-colors"
              >
                Cancel
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Simply generate the QR Code for the lecture
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default GenerateQR;
