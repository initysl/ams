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
import MarkPopover from "./MarkPopover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";

const ScanQR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center ">
      <p className="text-center text-pretty">
        Scan QR Code by using your camera or uploading to mark attendance
      </p>
      <div className="mt-20 ">
        <Card className="flex flex-col items-center justify-center p-5 ">
          <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed rounded-lg">
            {isScanning ? <Camera size={80} /> : <ScanQrCode size={80} />}
          </div>
        </Card>

        <div className="flex flex-col items-center justify-center mt-16 ">
          <Popover>
            <PopoverTrigger asChild>
              <MarkPopover triggerText="SCAN QR CODE" />
            </PopoverTrigger>
          </Popover>
        </div>
      </div>
    </div>
  );
};
export default ScanQR;
