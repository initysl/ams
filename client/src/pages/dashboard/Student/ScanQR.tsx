import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ListCheck, Loader2, Clipboard, Upload, Scan } from "lucide-react";
import { Link } from "react-router-dom";
import MarkPopover from "./MarkPopover";
import cardData from "@/components/json/scancard .json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

const cardColors = [
  "bg-teal-200",
  "bg-yellow-100",
  "bg-orange-200",
  "bg-purple-100",
];

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedToken, setScannedToken] = useState<string>("");

  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initial scan mutation to get course data
  const scanQRMutation = useMutation<AttendanceResponse, Error, string>({
    mutationFn: async (token: string) => {
      const response = await api.post<AttendanceResponse>("attendance/mark", {
        token,
        confirmAttendance: false, // Just get course data first
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
          setIsLoading(false);
          handleQRCodeScanned(decodedText);
        },
        (errorMessage: string) => {
          console.warn("QR Scan Error:", errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Failed to start QR scanner.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("QR code size must be under 2MB.");
      fileInputRef.current!.value = "";
      return;
    }

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      toast.error("Unsupported file type.");
      fileInputRef.current!.value = "";
      return;
    }

    setIsLoading(true);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      if (isScanning) await stopScanner();

      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      toast.success("QR code successfully read from image");
      handleQRCodeScanned(decodedText);
    } catch (err) {
      console.error("Image QR scan failed:", err);
      toast.error("Failed to scan QR code from image.");
    } finally {
      setIsLoading(false);
      fileInputRef.current!.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center gap-6  ">
      <div
        id="reader"
        ref={scannerRef}
        className="w-80 h-80 border rounded-lg bg-white shadow-inner flex items-center justify-center relative top-10"
      >
        {isLoading && (
          <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
        )}
      </div>

      <div className="flex items-center justify-center w-full max-w-sm gap-3 mt-20">
        {!isScanning ? (
          <Button
            variant={"outline"}
            onClick={startScanner}
            disabled={isLoading}
            className="border-teal-600 text-teal-600 hover:bg-teal-700 hover:text-white"
          >
            <Scan />
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : null}
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
          >
            Stop Scanning
          </Button>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant={"outline"}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="border-teal-600 text-teal-600 hover:bg-teal-700 hover:text-white"
        >
          <Upload />
        </Button>
        <div>
          <Link to="/dashboard/attendance" className="w-full max-w-sm">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2">
              View attendance
              <ListCheck />
            </Button>
          </Link>
        </div>
      </div>

      {scanResult && !showConfirmation && (
        <div className="bg-green-50 border border-green-400 text-green-800 px-4 py-3 rounded w-full max-w-sm flex items-center justify-between gap-2">
          <p className="text-sm truncate line-through opacity-30">
            {scanResult}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(scanResult);
              toast.success("Token copied!");
            }}
          >
            <Clipboard className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Render MarkPopover when confirmation is needed */}
      {showConfirmation && courseData && (
        <div className="w-full max-w-sm">
          <MarkPopover
            courseData={courseData}
            isOpen={showConfirmation}
            onConfirm={handleConfirmAttendance}
            onCancel={handleCancelConfirmation}
            isLoading={confirmAttendanceMutation.isPending}
          />
        </div>
      )}

      {cardData.scan.map((text, index) => (
        <Card
          key={index}
          className={`w-full bg-white shadow-md hover:shadow-xl transition rounded-xl p-4 flex flex-col justify-between ${
            cardColors[text.id % cardColors.length]
          }`}
        >
          <CardHeader className="p-0 mb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold">
                {text.title}
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {text.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-gray-700 font-medium">{text.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QRScanner;
