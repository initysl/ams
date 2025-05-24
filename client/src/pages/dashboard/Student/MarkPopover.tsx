import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Camera, QrCode } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";

interface MarkPopoverProps {
  triggerText?: string;
}

const MarkPopover: React.FC<MarkPopoverProps> = ({
  triggerText = "Open Popover",
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const handleConfirm = () => {
    if (!isChecked) return;
    setIsLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      setIsConfirmed(true);
    }, 2000);
  };

  const handleContinue = () => {
    setIsConfirmed(false);
    setIsChecked(false);
  };

  const popoverAnimation = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg cursor-pointer"
            aria-label="Open attendance marking popover"
          >
            {triggerText} <Camera />
          </Button>
        </PopoverTrigger>
        <AnimatePresence>
          <PopoverContent asChild>
            <motion.div
              {...popoverAnimation}
              transition={{ duration: 0.3 }}
              className="w-96 bg-white border border-gray-200 rounded-lg shadow-lg"
              role="dialog"
              aria-labelledby="popover-title"
              aria-describedby="popover-description"
            >
              {!isConfirmed ? (
                <div className="space-y-6 p-4">
                  <div className="flex justify-center">
                    <QrCode size={72} aria-hidden="true" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Course Code</p>
                        <span className="font-semibold">CSC 309</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <span className="font-semibold">11:30AM</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Course Title</p>
                      <span
                        id="popover-title"
                        className="font-semibold uppercase block"
                      >
                        Introduction to Python
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={isChecked}
                        onCheckedChange={(checked) => setIsChecked(!!checked)}
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Check to mark attendance for this lecturer
                      </Label>
                    </div>

                    <Button
                      onClick={handleConfirm}
                      disabled={isLoading || !isChecked}
                      className={`bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg cursor-pointer mt-5 ${
                        isLoading || !isChecked
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isLoading ? "Processing..." : "Confirm"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 p-4">
                  <h2
                    id="popover-title"
                    className="text-lg font-semibold text-center"
                  >
                    Attendance Marked Successfully!
                  </h2>
                  <p
                    id="popover-description"
                    className="text-sm text-gray-500 text-center"
                  >
                    You have successfully marked attendance for:
                  </p>
                  <div className="space-y-2 text-center">
                    <p className="font-semibold">Course Code: CSC 309</p>
                    <p className="font-semibold">
                      Course Title: Introduction to Python
                    </p>
                    <p className="font-semibold">Time: 11:30AM</p>
                  </div>
                  <Button
                    onClick={handleContinue}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg cursor-pointer mt-5"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </motion.div>
          </PopoverContent>
        </AnimatePresence>
      </Popover>
    </>
  );
};

export default MarkPopover;
