import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  CheckSquare,
  Loader,
  Scan,
  QrCode,
  Camera,
  CheckCircle,
  Zap,
  Clock,
  Target,
  X,
  ListCheck,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import MarkPopover from "./MarkPopover";

// Feature cards data
const cardData = {
  scan: [
    {
      id: 1,
      title: "Quick Scan",
      description: "Instant attendance marking",
      icon: <Zap className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      id: 2,
      title: "Instance Recognition",
      description: "Fast QR detection",
      icon: <Target className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      id: 3,
      title: "Real-time Update",
      description: "Instant attendance updates",
      icon: <Clock className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      id: 4,
      title: "View Attendance Record",
      description: "View your attendance record with just a click",
      icon: <ListCheck className="w-5 h-5" />,
      gradient: "from-rose-500 to-pink-400",
    },
  ],
};

type CourseData = {
  courseCode: string;
  courseTitle: string;
  level: string;
  duration: string;
  sessionTime: string;
};

type AttendanceResponse = {
  success: boolean;
  message?: string;
  requiresConfirmation?: boolean;
  courseData?: CourseData;
};

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedToken, setScannedToken] = useState<string>("");
  const [scannerActive, setScannerActive] = useState(false);

  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();
  // Initial scan mutation to get course data
  const scanQRMutation = useMutation<AttendanceResponse, Error, string>({
    mutationFn: async (token: string) => {
      const response = await api.post<AttendanceResponse>("attendance/mark", {
        token,
        confirmAttendance: false, // Get course data first
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.requiresConfirmation && data.courseData) {
        setCourseData(data.courseData);
        setShowConfirmation(true);
      } else if (data.success && data.message) {
        toast.success(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to scan QR code");
      setScanResult(null);
      setScannedToken("");
    },
  });

  // Final confirmation mutation to mark attendance
  const confirmAttendanceMutation = useMutation<
    AttendanceResponse,
    Error,
    string
  >({
    mutationFn: async (token: string) => {
      const response = await api.post<AttendanceResponse>("attendance/mark", {
        token,
        confirmAttendance: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.message) {
        toast.success(data.message);
        setShowConfirmation(false);
        setCourseData(null);
        setScanResult(null);
        setScannedToken("");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to mark attendance");
    },
  });

  const handleQRCodeScanned = (decodedText: string) => {
    setScanResult(decodedText);
    setScannedToken(decodedText);
    scanQRMutation.mutate(decodedText);
  };

  const handleConfirmAttendance = () => {
    if (scannedToken) {
      confirmAttendanceMutation.mutate(scannedToken);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setCourseData(null);
    setScanResult(null);
    setScannedToken("");
  };

  const startScanner = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
    }

    try {
      setIsLoading(true);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          html5QrCodeRef.current?.stop();
          setIsScanning(false);
          setScannerActive(false);
          setIsLoading(false);
          handleQRCodeScanned(decodedText);
        },
        // Debounce error toast to avoid rapid firing
        (() => {
          let lastToastTime = 0;
          return () => {
            const now = Date.now();
            if (now - lastToastTime > 10000) {
              toast.error("QR code not detected");
              lastToastTime = now;
            }
          };
        })()
      );
      setIsScanning(true);
      setScannerActive(true);
    } catch (err) {
      // console.error("Error starting scanner:", err);
      toast.error("Failed to start QR scanner.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => {});
      setIsScanning(false);
      setScannerActive(false);
    }
  };

  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   if (file.size > 2 * 1024 * 1024) {
  //     toast.error("QR code size must be under 2MB.");
  //     fileInputRef.current!.value = "";
  //     return;
  //   }

  //   const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
  //   if (!supportedTypes.includes(file.type)) {
  //     toast.error("Unsupported file type.");
  //     fileInputRef.current!.value = "";
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     if (!html5QrCodeRef.current) {
  //       html5QrCodeRef.current = new Html5Qrcode("reader", {
  //         formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  //         verbose: false,
  //       });
  //     }

  //     if (isScanning) await stopScanner();

  //     const decodedText = await html5QrCodeRef.current.scanFile(file, true);
  //     toast.success("QR code successfully read from image");
  //     handleQRCodeScanned(decodedText);
  //   } catch (err) {
  //     // console.error("Image QR scan failed:", err);
  //     // More specific error messages
  //     if (err instanceof Error) {
  //       if (err.message.includes("QR code not found")) {
  //         toast.error("No QR code found in the image.");
  //       } else if (err.message.includes("decoder failed")) {
  //         toast.error(
  //           "QR code found but couldn't be read. Try a clearer image."
  //         );
  //       } else {
  //         toast.error("Failed to scan QR code from image.");
  //       }
  //     }
  //   } finally {
  //     setIsLoading(false);
  //     fileInputRef.current!.value = "";
  //   }
  // };

  // const copyToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text);
  //   toast.success("Token copied!");
  // };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="min-h-svh relative overflow-hidden">
      <div className="container py-8 relative z-10">
        {/* Main Scanner Section */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            {/* Scanner Area */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="relative">
                {/* Outer glow ring */}
                <div
                  className={`absolute inset-0 rounded-3xl transition-all duration-1000 ${
                    scannerActive
                      ? "bg-teal-500 animate-pulse"
                      : "bg-gradient-to-r from-gray-300 to-gray-400 blur-lg opacity-20"
                  }`}
                ></div>

                {/* Scanner container */}
                <div
                  className={`relative w-80 h-80 rounded-3xl transition-all duration-500 ${
                    scannerActive
                      ? "bg-gradient-to-br from-white to-blue-50 shadow-2xl shadow-blue-500/25"
                      : "bg-white/80 backdrop-blur-sm shadow-xl"
                  } border border-white/50`}
                >
                  {/* Scanner viewport */}
                  <div
                    id="reader"
                    ref={scannerRef}
                    className="w-full h-full flex justify-center rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    {/* Scanner overlay */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      {scannerActive && (
                        <>
                          {/* Scanning animation */}
                          <div className="absolute inset-8 border-2 border-blue-500 rounded-2xl">
                            <div className="absolute inset-0 border-2 border-transparent rounded-2xl animate-ping "></div>
                            {/* Corner indicators */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-blue-500 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-blue-500 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-blue-500 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-blue-500 rounded-br-lg"></div>
                          </div>
                          {/* Scanning line */}
                          <div className="absolute inset-8 overflow-hidden rounded-2xl">
                            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                          </div>
                        </>
                      )}

                      {/* Default state */}
                      {!scannerActive && !isLoading && (
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                            <QrCode className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            Ready to scan
                          </p>
                        </div>
                      )}

                      {/* Loading state */}
                      {isLoading && (
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
                            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                          </div>
                          <p className="text-blue-600 font-medium">
                            Initializing...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Controls Panel */}
            <motion.div
              className="space-y-6 hidden sm:flex"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm p-5 border border-white/50 w-full">
                <CardHeader className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
                  <Camera className="w-5 h-5 mr-2 text-blue-500" />
                  Scanner Controls
                </CardHeader>

                <CardContent className="grid gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={isScanning ? "destructive" : "default"}
                      onClick={isScanning ? stopScanner : startScanner}
                      disabled={isLoading}
                      className={`h-12 font-medium transition-all duration-300 w-full ${
                        isScanning
                          ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
                          : "bg-teal-500 hover:bg-white hover:border-2 hover:border-gray-200"
                      }`}
                    >
                      {isScanning ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4 mr-2" />
                          {isLoading ? (
                            <Loader className="w-4 h-4 animate-spin ml-1" />
                          ) : (
                            "Scan"
                          )}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to="/dashboard/attendance" className="block">
                    <Button className="w-full mt-3 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:text-white shadow-lg shadow-emerald-500/25 transition-all duration-300">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      View Attendance Records
                    </Button>
                  </Link>
                </motion.div>
              </Card>
            </motion.div>
          </div>

          {/* Cotrols Panel Mobile */}
          {/* Mobile Controls Panel - FIXED VERSION */}
          <motion.div
            className="space-y-5 sm:hidden fixed bottom-5 right-5 z-50"
            initial={{
              opacity: 0,
              scale: 0.8,
              // Start from the final fixed position, not from document flow
              position: "fixed",
              bottom: "1.25rem", // 20px (bottom-5)
              right: "1.25rem", // 20px (right-5)
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              // Ensure it's always in fixed position, even during animation
              position: "fixed",
              bottom: "1.25rem",
              right: "1.25rem",
            }}
          >
            <div className="w-fit rounded-full bg-white/80 backdrop-blur-sm border border-white/50 p-2 shadow-lg">
              <div className="flex flex-col gap-3">
                {/* Scan/Stop Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={isScanning ? "destructive" : "default"}
                    onClick={isScanning ? stopScanner : startScanner}
                    disabled={isLoading}
                    className={`h-12 w-12 font-medium transition-all duration-300 rounded-full flex items-center justify-center ${
                      isScanning
                        ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
                        : "bg-teal-500 hover:bg-teal-600 shadow-xl shadow-teal-500/25 text-white"
                    }`}
                  >
                    {isScanning ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <>
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Attendance Records Button - FIXED VERSION */}
                <motion.button
                  onClick={() => navigate("/dashboard/attendance")} // Use navigate instead of Link
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-12 w-12 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-xl hover:shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <CheckSquare className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scan Result */}
        {scanResult && !showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-fit mx-auto mb-8 border border-emerald-200 rounded-2xl p-4 shadow-lg">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="text-emerald-800 font-medium">
                    Processing
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && courseData && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <MarkPopover
              courseData={courseData}
              isOpen={showConfirmation}
              onConfirm={handleConfirmAttendance}
              onCancel={handleCancelConfirmation}
              isLoading={confirmAttendanceMutation.isPending}
            />
          </div>
        )}

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {cardData.scan.map((card, index) => (
            <motion.div
              key={card.id}
              className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.9 + index * 0.1,
              }}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl bg-gradient-to-br ${card.gradient} transition-opacity duration-500`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                  >
                    {card.icon}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm mb-3 transition-colors duration-300">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default QRScanner;
