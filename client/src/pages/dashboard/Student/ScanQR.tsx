import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Loader,
  Clipboard,
  Upload,
  Scan,
  QrCode,
  Camera,
  CheckCircle,
  Zap,
  Clock,
  BookOpen,
  Users,
  Target,
  Sparkles,
  X,
  ListCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

// Mock data for demonstration
const cardData = {
  scan: [
    {
      id: 1,
      title: "Quick Scan",
      description: "Instant attendance marking",
      value: "Point & Scan",
      icon: <Zap className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      id: 2,
      title: "Smart Recognition",
      description: "Fast QR detection",
      value: "99.9% Accuracy",
      icon: <Target className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      id: 3,
      title: "Real-time Sync",
      description: "Instant attendance updates",
      value: "Live Updates",
      icon: <Clock className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      id: 4,
      title: "View Attendance Record",
      description: "View your attendance record with just a click",
      value: "Smooth and swift",
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

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedToken, setScannedToken] = useState<string>("");
  const [scannerActive, setScannerActive] = useState(false);

  const scannerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mock functions for demonstration
  const handleQRCodeScanned = (decodedText: string) => {
    setScanResult(decodedText);
    setScannedToken(decodedText);
    // Mock course data
    setCourseData({
      courseCode: "CS301",
      courseTitle: "Advanced Web Development",
      level: "300 Level",
      duration: "2 Hours",
      sessionTime: "10:00 AM - 12:00 PM",
    });
    setShowConfirmation(true);
  };

  const handleConfirmAttendance = () => {
    setShowConfirmation(false);
    setCourseData(null);
    setScanResult(null);
    setScannedToken("");
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setCourseData(null);
    setScanResult(null);
    setScannedToken("");
  };

  const startScanner = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsScanning(true);
      setScannerActive(true);
      setIsLoading(false);
    }, 1000);
  };

  const stopScanner = async () => {
    setIsScanning(false);
    setScannerActive(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setTimeout(() => {
      handleQRCodeScanned("mock-token-from-file");
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-svh relative overflow-hidden">
      {/* Animated background elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80  animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40  rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div> */}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Main Scanner Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Scanner Area */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Outer glow ring */}
                <div
                  className={`absolute inset-0 rounded-3xl transition-all duration-1000 ${
                    scannerActive
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse"
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
                    className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
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
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm p-5 border border-white/50">
                <CardHeader className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
                  <Camera className="w-5 h-5 mr-2 text-blue-500" />
                  Scanner Controls
                </CardHeader>

                <CardContent className="grid grid-cols-2 gap-3">
                  <Button
                    variant={isScanning ? "destructive" : "default"}
                    onClick={isScanning ? stopScanner : startScanner}
                    disabled={isLoading}
                    className={`h-12 font-medium transition-all duration-300 ${
                      isScanning
                        ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25"
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

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </CardContent>

                <Link to="/dashboard/attendance" className="block">
                  <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:text-white shadow-lg shadow-emerald-500/25 transition-all duration-300">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    View Attendance Records
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && !showConfirmation && (
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="text-emerald-800 font-medium">
                    QR Code Scanned Successfully
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(scanResult)}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                >
                  <Clipboard className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && courseData && (
          <Card className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <CardContent className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <CardHeader className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Confirm Attendance</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelConfirmation}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
              </div>

              <CardDescription className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course Code:</span>
                    <span className="font-semibold">
                      {courseData.courseCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course Title:</span>
                    <span className="font-semibold">
                      {courseData.courseTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold">{courseData.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{courseData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Time:</span>
                    <span className="font-semibold">
                      {courseData.sessionTime}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelConfirmation}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmAttendance}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto ">
          {cardData.scan.map((card, index) => (
            <div
              key={card.id}
              className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
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
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 text-sm mb-3 transition-colors duration-300">
                  {card.description}
                </p>
                <div className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors duration-300">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
