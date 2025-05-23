import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ScanQrCode,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ScanQR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center ">
      <p className="text-center text-pretty">
        Scan QR Code by using your camera or uploading to mark attendance
      </p>
      <div className="mt-20">
        <Card className="flex flex-col items-center justify-center p-5 mx-w-4xl">
          <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed rounded-lg">
            {isScanning ? <Camera size={80} /> : <ScanQrCode size={80} />}
          </div>
        </Card>

        <div className="flex flex-col items-center justify-center mt-10 space-y-8">
          <div className="flex items-center justify-center mt-4 gap-5">
            <Button
              variant="outline"
              className="border-2 border-teal-600 hover:bg-teal-700 hover:text-white"
            >
              Upload <Upload />{" "}
            </Button>
            <Button
              variant="outline"
              className="border-2 border-teal-600 hover:bg-teal-700 hover:text-white"
            >
              Camera <Camera />{" "}
            </Button>
          </div>

          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg cursor-pointer">
            SCAN
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;
