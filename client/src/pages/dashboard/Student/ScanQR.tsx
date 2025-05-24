import React, { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
} from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// Type for the attendance API response
type AttendanceResponse = {
  message: string;
};

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const markAttendanceMutation = useMutation<AttendanceResponse, Error, string>(
    {
      mutationFn: async (token: string) => {
        const response = await api.post<AttendanceResponse>("attendance/mark", {
          token,
        });
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error || "Failed to mark attendance"
        );
      },
    }
  );

  const startScanner = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
    }

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText: string) => {
          html5QrCodeRef.current?.stop();
          setIsScanning(false);
          setScanResult(decodedText);
          markAttendanceMutation.mutate(decodedText);
        },
        (errorMessage: string) => {
          console.warn("QR Scan Error:", errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Failed to start QR scanner.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
    }

    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      setScanResult(decodedText);
      toast.success("QR code successfully read from image");
      markAttendanceMutation.mutate(decodedText);
    } catch (err) {
      console.error("Image QR scan failed:", err);
      toast.error("Failed to scan QR code from image.");
    } finally {
      // Reset the file input so user can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="flex flex-col items-center gap-4">
      <div
        id="reader"
        ref={scannerRef}
        className="w-80 h-80 border rounded-lg bg-white shadow-sm"
      />

      <div className="flex flex-col gap-2 items-center">
        {!isScanning ? (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={startScanner}
          >
            Start Scanning
          </Button>
        ) : (
          <Button className="bg-red-600 hover:bg-red-700" onClick={stopScanner}>
            Stop Scanning
          </Button>
        )}

        <input
          type="file"
          accept="image/png"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />

        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Upload QR Image
        </Button>
      </div>

      {scanResult && (
        <p className="text-green-700 font-medium text-center">
          ✅ Scanned Token: {scanResult}
        </p>
      )}
    </div>
  );
};

export default QRScanner;
