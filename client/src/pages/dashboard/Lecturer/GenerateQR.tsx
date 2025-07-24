import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdaptiveInput } from "@/components/app-ui/adaptive-input";
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
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import qrplaceholder from "../../../assets/images/qr-placeholder.svg";
import { AlertCircle, Clock, Loader2, Printer, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

const qrSchema = z.object({
  courseTitle: z.string().min(5, "Course title is required"),
  totalCourseStudents: z.number().min(1, "At least one student is required"),
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

// Animation variants (keeping the same as before)
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

const GenerateQR = () => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [courseDetails, setCourseDetails] = useState<{
    courseTitle: string;
    totalCourseStudents: number;
    courseCode: string;
    level: string;
    duration: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GenerateFields>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      courseTitle: "",
      totalCourseStudents: 30,
      courseCode: "",
      level: "400",
      duration: 10,
    },
  });

  // Generate QR Code Mutation
  const generateQRMutation = useMutation({
    mutationFn: async (data: GenerateFields) => {
      const response = await api.post("attendance/generate", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const { qrCodeUrl, sessionId, expiryTime, courseDetails } = data;
      setQrCodeUrl(qrCodeUrl);
      setSessionId(sessionId);
      setExpiryTime(expiryTime);
      setCourseDetails(courseDetails);
      setQrGenerated(true);
      setIsExpired(false);
      toast.success("QR code generated successfully");
    },
    onError: (error) => {
      toast.error(`Error generating QR code ${error}`);
      // console.error("Error generating QR code:", error);
    },
  });

  // Stop Session Mutation
  const stopSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.post(
        `attendance/stop/${sessionId}`,
        {},
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      setQrGenerated(false);
      setIsExpired(false);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("QR code stopped successfully");
    },
    onError: () => {
      toast.error("Error stopping QR code session");
      // console.error("Error stopping session:", error);
    },
  });

  // Delete Session Mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`attendance/session/${sessionId}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success("Session deleted successfully");
      // Reset UI state
      setQrGenerated(false);
      setQrCodeUrl("");
      setSessionId("");
      setExpiryTime("");
      setCourseDetails(null);
      setIsExpired(false);
      localStorage.removeItem(STORAGE_KEY);
      reset();
    },
    onError: () => {
      toast.error("Error deleting session");
      // console.error("Error deleting session:", error);
      // Still reset UI state even if API fails
      setQrGenerated(false);
      setQrCodeUrl("");
      setSessionId("");
      setExpiryTime("");
      setCourseDetails(null);
      setIsExpired(false);
      localStorage.removeItem(STORAGE_KEY);
      reset();
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
            setIsExpired(false);
          } else {
            // Session is expired, clear it
            localStorage.removeItem(STORAGE_KEY);
            setIsExpired(true);
          }
        }
      } catch (error) {
        console.error("Error loading saved session:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadSavedSession();
  }, []);

  // Timer effect (keeping the same as before)
  useEffect(() => {
    if (!expiryTime || !qrGenerated) return;

    const calculateTimeLeft = () => {
      const expiryDate = new Date(expiryTime);
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setQrGenerated(false);
        toast.info("QR code expired");
        localStorage.removeItem(STORAGE_KEY);
        return { minutes: 0, seconds: 0 };
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { minutes, seconds };
    };

    const initialTimeLeft = calculateTimeLeft();
    setTimeRemaining(initialTimeLeft);

    if (initialTimeLeft.minutes === 0 && initialTimeLeft.seconds === 0) {
      setIsExpired(true);
    }

    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeRemaining(timeLeft);

      if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, qrGenerated]);

  // Save session data to localStorage whenever it changes
  useEffect(() => {
    if (qrGenerated && sessionId && expiryTime && courseDetails && !isExpired) {
      const sessionData = {
        qrGenerated,
        qrCodeUrl,
        sessionId,
        expiryTime,
        courseDetails,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }
  }, [qrGenerated, qrCodeUrl, sessionId, expiryTime, courseDetails, isExpired]);

  // Handler functions
  const handleGenerateQR = (data: GenerateFields) => {
    generateQRMutation.mutate(data);
  };

  const handleStop = () => {
    if (!sessionId) return;
    stopSessionMutation.mutate(sessionId);
  };

  const handleCancel = () => {
    if (qrGenerated && sessionId) {
      deleteSessionMutation.mutate(sessionId);
    } else {
      // If no active session, just reset the form
      setQrGenerated(false);
      setQrCodeUrl("");
      setSessionId("");
      setExpiryTime("");
      setCourseDetails(null);
      setIsExpired(false);
      localStorage.removeItem(STORAGE_KEY);
      reset();
    }
  };

  const handleDownload = () => {
    if (isExpired) {
      toast.error("Cannot download expired QR code");
      return;
    }

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr_code_${courseDetails?.courseCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (isExpired) {
      toast.error("Cannot print expired QR code");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.writeln(`
        <html>
          <head>
            <title>QR Code - ${courseDetails?.courseCode}</title>
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
            <img src=${qrCodeUrl} alt="${courseDetails?.courseCode} QR Code" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const QRPlaceholder = ({ generated = false }) => (
    <div className="flex flex-col items-center justify-center min-h-52 border border-gray-200 mb-6 p-4 rounded-lg">
      {generated ? (
        <div className={`${isExpired ? "opacity-50 grayscale" : ""}`}>
          <img
            src={qrCodeUrl}
            alt="Generated QR Code"
            className="w-52 h-52 mb-4"
          />
        </div>
      ) : (
        <div className="w-40 h-40 mb-4 flex items-center justify-center">
          <img src={qrplaceholder} alt="QR Code placeholder" />
        </div>
      )}
      <p className="text-gray-500 text-sm text-center">
        {generated
          ? isExpired
            ? "QR Code has expired"
            : "QR Code has been generated"
          : "QR Code not generated yet"}
      </p>
      {generated && timeRemaining && (
        <div
          className={`mt-2 flex items-center gap-1 px-3 py-1 rounded-full ${
            isExpired
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          <Clock size={16} />
          <span className="font-medium">
            {isExpired ||
            (timeRemaining.minutes === 0 && timeRemaining.seconds === 0)
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
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white">
            <CardHeader className="card-header border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-xl text-gray-800">
                {isExpired
                  ? "Expired QR Code Session"
                  : "Active QR Code Session"}
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <QRPlaceholder generated={true} />
                  <motion.div
                    className="grid grid-cols-2 gap-4 mt-4"
                    variants={itemVariants}
                  >
                    <motion.div
                      variants={buttonVariants}
                      whileHover={!isExpired ? "hover" : undefined}
                      whileTap={!isExpired ? "tap" : undefined}
                    >
                      <Button
                        onClick={handleDownload}
                        disabled={isExpired}
                        className={`w-full h-10 rounded-md font-medium transition-colors ${
                          isExpired
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <Save size={16} />
                        Download
                      </Button>
                    </motion.div>
                    <motion.div
                      variants={buttonVariants}
                      whileHover={!isExpired ? "hover" : undefined}
                      whileTap={!isExpired ? "tap" : undefined}
                    >
                      <Button
                        onClick={handlePrint}
                        disabled={isExpired}
                        className={`w-full h-10 rounded-md font-medium transition-colors ${
                          isExpired
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        <Printer size={16} />
                        Print
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div className="space-y-6" variants={itemVariants}>
                  <motion.div
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-medium text-gray-800 mb-3">
                      Session Details
                    </h3>
                    {courseDetails && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                      >
                        {[
                          {
                            label: "Course Title",
                            value: courseDetails.courseTitle,
                          },
                          {
                            label: "Total Students",
                            value: `${courseDetails.totalCourseStudents} students`,
                          },
                          {
                            label: "Course Code",
                            value: courseDetails.courseCode,
                          },
                          { label: "Level", value: courseDetails.level },
                          {
                            label: "Duration",
                            value: `${courseDetails.duration} minutes`,
                          },
                          {
                            label: "Expires at",
                            value: new Date(expiryTime).toLocaleTimeString(
                              "en-US"
                            ),
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            className="flex justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <span className="text-gray-500">{item.label}:</span>
                            <span className="">{item.value}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    className="flex flex-col gap-3"
                    variants={itemVariants}
                  >
                    <motion.div
                      variants={buttonVariants}
                      whileHover={!isExpired ? "hover" : undefined}
                      whileTap={!isExpired ? "tap" : undefined}
                    >
                      <Button
                        onClick={handleStop}
                        disabled={stopSessionMutation.isPending || isExpired}
                        className={`h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2 w-full ${
                          isExpired
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {stopSessionMutation.isPending ? (
                            <motion.div
                              key="stopping"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              Processing
                              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="stop"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Clock size={16} />
                              {isExpired
                                ? "Session Expired"
                                : "Stop QR Code (Keep Record)"}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>

                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        onClick={handleCancel}
                        disabled={deleteSessionMutation.isPending}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2 w-full"
                      >
                        <AnimatePresence mode="wait">
                          {deleteSessionMutation.isPending ? (
                            <motion.div
                              key="deleting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              Deleting
                              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="delete"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <X size={16} />
                              {isExpired
                                ? "Delete Expired Session"
                                : "Delete Session & Generate New"}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                      isExpired
                        ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle size={18} className="mt-0.5" />
                    <p>
                      {isExpired
                        ? "This QR code has expired and can no longer be used for attendance. You can delete this session and generate a new one."
                        : "Students can scan this QR code to mark their attendance for this lecture session."}
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.form
        onSubmit={handleSubmit(handleGenerateQR)}
        className="space-y-6"
        variants={itemVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-xl">
            <CardContent>
              <div className="space-y-6">
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  variants={itemVariants}
                >
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 * 0.1 }}
                  >
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Controller
                        name="courseTitle"
                        control={control}
                        render={({ field }) => (
                          <AdaptiveInput
                            {...field}
                            id="course-title"
                            type="text"
                            label="Course Title"
                            error={errors.courseTitle?.message}
                            className="w-full"
                          />
                        )}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 * 0.1 }}
                  >
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Controller
                        name="totalCourseStudents"
                        control={control}
                        defaultValue={30} // ← here
                        render={({ field: { onChange, value, ...rest } }) => (
                          <AdaptiveInput
                            {...rest}
                            id="total-students"
                            type="number"
                            min={1}
                            max={500}
                            label="Total Course Students"
                            value={value ?? ""} // safe fallback
                            onChange={(e) => {
                              const v = e.target.value;
                              onChange(v === "" ? "" : Number(v)); // keep empty as ""
                            }}
                            error={errors.totalCourseStudents?.message}
                            helperText="Maximum 500 students allowed"
                            className="w-full"
                          />
                        )}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  variants={itemVariants}
                >
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 * 0.1 }}
                  >
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Controller
                        name="courseCode"
                        control={control}
                        render={({ field }) => (
                          <AdaptiveInput
                            {...field}
                            id="course-code"
                            type="text"
                            label="Course Code"
                            error={errors.courseCode?.message}
                            className="w-full"
                          />
                        )}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 * 0.1 }}
                  >
                    <div className="space-y-2">
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Controller
                          name="level"
                          control={control}
                          render={({ field: controllerField }) => (
                            <Select
                              onValueChange={controllerField.onChange}
                              value={controllerField.value}
                              name="level"
                            >
                              <SelectTrigger
                                id="level"
                                className={cn(
                                  "w-full px-3  text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
                                  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent",
                                  "min-h-[3rem]",
                                  errors.level
                                    ? "border-red-500 focus:ring-red-600"
                                    : "border-slate-400"
                                )}
                              >
                                <SelectValue placeholder="Choose level" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-300 rounded-md">
                                <SelectGroup>
                                  {["100", "200", "300", "400", "500"].map(
                                    (level) => (
                                      <SelectItem
                                        key={level}
                                        value={level}
                                        className="hover:bg-gray-100 focus:bg-gray-100"
                                      >
                                        Level {level}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </motion.div>
                      <AnimatePresence>
                        {errors.level && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {errors.level.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2 * 0.1 }}
                  >
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Controller
                        name="duration"
                        control={control}
                        defaultValue={10}
                        render={({ field: { onChange, value, ...rest } }) => (
                          <AdaptiveInput
                            {...rest}
                            id="duration"
                            type="number"
                            min={1}
                            max={60}
                            label="Duration (minutes)"
                            value={value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              onChange(v === "" ? "" : Number(v));
                            }}
                            error={errors.duration?.message}
                            helperText=" 1-60 minutes"
                            className="w-full"
                          />
                        )}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-xl">
            <CardContent className="pt-4">
              <QRPlaceholder />
              <motion.div className="flex gap-4" variants={itemVariants}>
                <motion.div
                  className="flex-1"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="submit"
                    disabled={generateQRMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <AnimatePresence mode="wait">
                      {generateQRMutation.isPending ? (
                        <motion.div
                          key="generating"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Generating{" "}
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="generate"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Generate
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
                <motion.div
                  className="flex-1"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="button"
                    onClick={() => reset()}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Reset
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default GenerateQR;
