import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";

type CourseData = {
  courseCode: string;
  courseTitle: string;
  level: string;
  duration: string;
  sessionTime: string;
};

interface MarkPopoverProps {
  courseData: CourseData;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  triggerText?: string;
}

const MarkPopover: React.FC<MarkPopoverProps> = ({
  courseData,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  triggerText = "Confirm Attendance",
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Reset state when popover opens
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setIsConfirmed(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!isChecked || isLoading) return;
    onConfirm();
    setIsConfirmed(true);
  };

  const handleContinue = () => {
    setIsConfirmed(false);
    setIsChecked(false);
    onCancel();
  };

  const popoverAnimation = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  // If not open, render nothing (controlled externally)
  if (!isOpen) return null;

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <AnimatePresence>
        <motion.div
          {...popoverAnimation}
          transition={{ duration: 0.3 }}
          className="max-w-4xl bg-white border border-gray-200 rounded-xl shadow-lg relative"
          role="dialog"
          exit={{ opacity: 0 }}
          aria-labelledby="popover-title"
          aria-describedby="popover-description"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>

          {!isConfirmed ? (
            <div className="space-y-6 p-4">
              <div className="flex justify-center pt-2"></div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Course Code</p>
                    <span className="font-medium">{courseData.courseCode}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <span className="font-medium">
                      {courseData.sessionTime}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Course Title</p>
                  <span
                    id="popover-title"
                    className="font-medium uppercase block"
                  >
                    {courseData.courseTitle}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <span className="font-medium">{courseData.level}</span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <span className="font-medium text-orange-600">
                    {courseData.duration}
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
                    Check to mark attendance for this lecture
                  </Label>
                </div>

                <Button
                  onClick={handleConfirm}
                  disabled={isLoading || !isChecked}
                  className={`bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full shadow-lg mt-5 ${
                    isLoading || !isChecked
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? "Marking Attendance..." : triggerText}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-4">
              <h2
                id="popover-title"
                className="text-lg font-semibold text-center text-green-700"
              >
                Attendance Marked Successfully!
              </h2>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p
                id="popover-description"
                className="text-sm text-gray-500 text-center"
              >
                You have successfully marked attendance for:
              </p>
              <div className="space-y-2 text-center">
                <p className="font-semibold">
                  Course Code: {courseData.courseCode}
                </p>
                <p className="font-semibold">
                  Course Title: {courseData.courseTitle}
                </p>
                <p className="font-semibold">Level: {courseData.level}</p>
                <p className="font-semibold">Time: {courseData.sessionTime}</p>
              </div>
              <Button
                onClick={handleContinue}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full shadow-lg mt-5"
              >
                Continue
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

export default MarkPopover;
