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
import { motion, AnimatePresence } from "framer-motion";
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

// Animation variants
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

const qrCodeVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      type: "spring",
      stiffness: 100,
    },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
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

const timerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
  warning: {
    scale: [1, 1.1, 1],
    color: ["#f59e0b", "#ef4444", "#f59e0b"],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

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

  // Add state to track if QR code is expired
  const [isExpired, setIsExpired] = useState(false);

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

  // Function to calculate time remaining and update every second
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

    // Initial calculation
    const initialTimeLeft = calculateTimeLeft();
    setTimeRemaining(initialTimeLeft);

    // Check if already expired
    if (initialTimeLeft.minutes === 0 && initialTimeLeft.seconds === 0) {
      setIsExpired(true);
    }

    // Set up interval to update time remaining
    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeRemaining(timeLeft);

      // If time is up, clear the interval and set expired state
      if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    // Clean up interval on unmount or when QR code is no longer generated
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
      setIsExpired(false); // Reset expired state for new QR code

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
      setIsExpired(false);
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
    setIsExpired(false);

    // Remove from localStorage
    localStorage.removeItem(STORAGE_KEY);

    reset(); // Reset form to default values
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
          : "QR Code not processed yet"}
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
                        Download QR <Save size={16} />
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
                        Print QR <Printer size={16} />
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
                            value: new Date(expiryTime).toLocaleTimeString(),
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
                            <span className="font-medium">{item.value}</span>
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
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        onClick={handleStop}
                        disabled={isStopping}
                        className="bg-amber-500 hover:bg-amber-600 text-white h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2 w-full"
                      >
                        <AnimatePresence mode="wait">
                          {isStopping ? (
                            <motion.div
                              key="stopping"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="stop"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Clock size={16} /> Stop QR Code (Keep Record)
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
                        disabled={isDeleting}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 h-10 rounded-md font-medium transition-colors flex items-center justify-center gap-2 w-full"
                      >
                        <AnimatePresence mode="wait">
                          {isDeleting ? (
                            <motion.div
                              key="deleting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="delete"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <X size={16} /> Delete Session & Generate New
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
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
                        : "Students can scan this QR code to mark their attendance for this lecture session. This QR will persist even if you refresh the page."}
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
          <Card className="bg-white">
            <CardContent>
              <div className="space-y-6">
                <motion.div className="space-y-2" variants={itemVariants}>
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      id="courseTitle"
                      type="text"
                      placeholder="Enter course title"
                      {...register("courseTitle")}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.courseTitle && (
                      <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.courseTitle.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  variants={itemVariants}
                >
                  {[
                    {
                      id: "courseCode",
                      label: "Course Code",
                      placeholder: "Enter course code",
                      error: errors.courseCode,
                      register: register("courseCode"),
                    },
                    {
                      id: "level",
                      label: "Course Level",
                      isSelect: true,
                      error: errors.level,
                    },
                    {
                      id: "duration",
                      label: "Duration (minutes)",
                      type: "number",
                      min: 1,
                      max: 60,
                      placeholder: "20",
                      error: errors.duration,
                      register: register("duration", { valueAsNumber: true }),
                    },
                  ].map((field, index) => (
                    <motion.div
                      key={field.id}
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Label htmlFor={field.id}>{field.label}</Label>
                      {field.isSelect ? (
                        <Controller
                          name="level"
                          control={control}
                          render={({ field: controllerField }) => (
                            <Select
                              onValueChange={controllerField.onChange}
                              value={controllerField.value}
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
                      ) : (
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id={field.id}
                            type={field.type || "text"}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder}
                            {...field.register}
                          />
                        </motion.div>
                      )}
                      <AnimatePresence>
                        {field.error && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {field.error.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white">
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
                    disabled={isGenerating}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div
                          key="generating"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Generating...{" "}
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="generate"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Generate QR Code
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
                    Reset <ListRestart size={16} />
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
