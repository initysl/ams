import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// Import SVG as a string
import qrplaceholder from "../../../assets/images/qr-placeholder.svg";
import {
  AlertCircle,
  Clock,
  ListRestart,
  Loader2,
  Printer,
  Save,
  X,
} from "lucide-react";

const qrSchema = z.object({
  courseTitle: z.string().min(5, "Course title is required"),
  courseCode: z.string().min(5, "Course code is required"),
  level: z.enum(["100", "200", "300", "400", "500"], {
    required_error: "Course level is required",
  }),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(60, "Duration must be at most 60 minutes"),
});

// Local storage key
const STORAGE_KEY = "qr_session_data";

type GenerateFields = z.infer<typeof qrSchema>;

const GenerateQR = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [courseDetails, setCourseDetails] = useState<{
    courseCode: string;
    courseTitle: string;
    level: string;
    duration: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 0,
    seconds: 0,
  });

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
      level: "400",
      duration: 20,
    },
  });

  // Load saved session from localStorage on component mount
  useEffect(() => {
    const loadSavedSession = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);

          // Check if the session is expired
          const expiryDate = new Date(parsedData.expiryTime);
          const now = new Date();

          if (expiryDate > now) {
            // Session is still valid
            setQrGenerated(true);
            setQrCodeUrl(parsedData.qrCodeUrl);
            setSessionId(parsedData.sessionId);
            setExpiryTime(parsedData.expiryTime);
            setCourseDetails(parsedData.courseDetails);
          } else {
            // Session is expired, clear it
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading saved session:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadSavedSession();
  }, []);

  // Function to calculate time remaining and update every second
  useEffect(() => {
    if (!expiryTime || !qrGenerated) return;

    const calculateTimeLeft = () => {
      const expiryDate = new Date(expiryTime);
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();

      if (difference <= 0) {
        setQrGenerated(false);
        toast.info("QR code expired");
        localStorage.removeItem(STORAGE_KEY);
        return { minutes: 0, seconds: 0 };
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { minutes, seconds };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeLeft());

    // Set up interval to update time remaining
    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeRemaining(timeLeft);

      // If time is up, clear the interval
      if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Clean up interval on unmount or when QR code is no longer generated
    return () => clearInterval(timer);
  }, [expiryTime, qrGenerated]);

  // Save session data to localStorage whenever it changes
  useEffect(() => {
    if (qrGenerated && sessionId && expiryTime && courseDetails) {
      const sessionData = {
        qrGenerated,
        qrCodeUrl,
        sessionId,
        expiryTime,
        courseDetails,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }
  }, [qrGenerated, qrCodeUrl, sessionId, expiryTime, courseDetails]);

  const handleGenerateQR = async (data: GenerateFields) => {
    setIsGenerating(true);
    try {
      const response = await api.post("attendance/generate", data, {
        withCredentials: true,
      });

      // Extract data from response
      const { qrCodeUrl, sessionId, expiryTime, courseDetails } = response.data;

      setQrCodeUrl(qrCodeUrl);
      setSessionId(sessionId);
      setExpiryTime(expiryTime);
      setCourseDetails(courseDetails);
      setQrGenerated(true);

      toast.success("QR code generated successfully");
    } catch (error) {
      toast.error("Error generating QR code");
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;

    setIsStopping(true);
    try {
      // Call API to stop the session but retain it in the database
      await api.post(
        `attendance/stop/${sessionId}`,
        {},
        {
          withCredentials: true,
        }
      );

      setQrGenerated(false);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("QR code stopped successfully");
    } catch (error) {
      toast.error("Error stopping QR code session");
      console.error("Error stopping session:", error);
    } finally {
      setIsStopping(false);
    }
  };

  const handleCancel = async () => {
    if (qrGenerated && sessionId) {
      setIsDeleting(true);
      try {
        // Call API to delete the session from the database
        await api.delete(`attendance/session/${sessionId}`, {
          withCredentials: true,
        });

        toast.success("Session deleted successfully");
      } catch (error) {
        toast.error("Error deleting session");
        console.error("Error deleting session:", error);
      } finally {
        setIsDeleting(false);
      }
    }

    // Reset UI state regardless of API success/failure
    setQrGenerated(false);
    setQrCodeUrl("");
    setSessionId("");
    setExpiryTime("");
    setCourseDetails(null);

    // Remove from localStorage
    localStorage.removeItem(STORAGE_KEY);

    reset(); // Reset form to default values
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr_code_${courseDetails?.courseCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.writeln(`
        <html>
          <head>
            <title className="text-cente ">QR Code - ${courseDetails?.courseCode}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .details {
                margin-bottom: 20px;
                text-align: center;
              }
              h2 {
                margin-bottom: 5px;
              }
              p {
                margin: 5px 0;
              }
              img {
                max-width: 80%;
                max-height: 60vh;
                border: 1px solid #ddd;
                padding: 10px;
              }
            </style>
          </head>
          <body>
            <div class="details">
              <h2>${courseDetails?.courseTitle} (${courseDetails?.courseCode})</h2>
              <p>Level: ${courseDetails?.level}</p>
              <p>Duration: ${courseDetails?.duration} minutes</p>
            </div>
            <img src="${qrCodeUrl}" alt="${courseDetails?.courseCode} QR Code" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // // Server polling to check if the session is still active (in case it was stopped from another device)
  // useEffect(() => {
  //   // Only poll if we have an active session
  //   if (!qrGenerated || !sessionId) return;

  //   const checkSessionStatus = async () => {
  //     try {
  //       const response = await api.get(
  //         `attendance/session/${sessionId}/status`,
  //         {
  //           withCredentials: true,
  //         }
  //       );

  //       // If session is no longer active but we think it is
  //       if (!response.data.active && qrGenerated) {
  //         setQrGenerated(false);
  //         localStorage.removeItem(STORAGE_KEY);
  //         toast.info("This QR session has been stopped from another device");
  //       }
  //     } catch (error: any) {
  //       // If we get a 404, the session doesn't exist anymore
  //       if (error?.response && error.response?.status === 404) {
  //         setQrGenerated(false);
  //         localStorage.removeItem(STORAGE_KEY);
  //         toast.info("This QR session is no longer available");
  //       }
  //     }
  //   };

  //   // Check immediately and then every 30 seconds
  //   checkSessionStatus();
  //   const interval = setInterval(checkSessionStatus, 30000);

  //   return () => clearInterval(interval);
  // }, [qrGenerated, sessionId]);

  const QRPlaceholder = ({ generated = false }) => (
    <div className="flex flex-col items-center justify-center min-h-52 border border-gray-200 mb-6 p-4 rounded-lg">
      {generated ? (
        <img
          src={qrCodeUrl}
          alt="Generated QR Code"
          className="w-52 h-52 mb-4"
        />
      ) : (
        <div className="w-40 h-40 mb-4 flex items-center justify-center">
          <img src={qrplaceholder} alt="QR Code placeholder" />
        </div>
      )}
      <p className="text-gray-500 text-sm text-center">
        {generated ? "QR Code has been generated" : "QR Code not processed yet"}
      </p>
      {generated && timeRemaining && (
        <div className="mt-2 flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          <Clock size={16} />
          <span className="font-medium">
            {timeRemaining.minutes === 0 && timeRemaining.seconds === 0
              ? "QR Code expired"
              : `${String(timeRemaining.minutes).padStart(2, "0")}:${String(
                  timeRemaining.seconds
                ).padStart(2, "0")} remaining`}
          </span>
        </div>
      )}
    </div>
  );

  if (qrGenerated) {
    return (
      <div className=" space-y-6">
        <Card className="bg-white">
          <CardHeader className="card-header border-b border-gray-100 bg-gray-50">
            <CardTitle className=" text-xl text-gray-800">
              Active QR Code Session
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <QRPlaceholder generated={true} />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-md font-medium transition-colors"
                  >
                    Download QR Code <Save size={16} />
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 rounded-md font-medium transition-colors"
                  >
                    Print QR <Printer size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Session Details
                  </h3>
                  {courseDetails && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Course Title:</span>
                        <span className="font-medium">
                          {courseDetails.courseTitle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Course Code:</span>
                        <span className="font-medium">
                          {courseDetails.courseCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Level:</span>
                        <span className="font-medium">
                          {courseDetails.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                          {courseDetails.duration} minutes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires at:</span>
                        <span className="font-medium">
                          {new Date(expiryTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleStop}
                    disabled={isStopping}
                    className="bg-amber-500 hover:bg-amber-600 text-white h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isStopping ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Clock size={16} /> Stop QR Code (Keep Record)
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleCancel}
                    disabled={isDeleting}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>Deleting...</>
                    ) : (
                      <>
                        <X size={16} /> Delete Session & Generate New
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                  <AlertCircle size={18} className="mt-0.5" />
                  <p>
                    Students can scan this QR code to mark their attendance for
                    this lecture session. This QR will persist even if you
                    refresh the page.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(handleGenerateQR)} className="space-y-6">
        <Card className="bg-white">
          <CardContent>
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
                  <Label htmlFor="level">Course Level</Label>
                  <Controller
                    name="level"
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
                  {errors.level && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.level.message}
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
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-4">
            <QRPlaceholder />
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white  rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    Generating... <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>Generate QR Code</>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => reset()}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
              >
                Reset <ListRestart size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default GenerateQR;
