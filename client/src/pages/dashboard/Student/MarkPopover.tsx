import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Camera, QrCode } from "lucide-react";

interface MarkPopoverProps {
  triggerText?: string;
}

const MarkPopover: React.FC<MarkPopoverProps> = ({
  triggerText = "Open Popover",
}) => {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg cursor-pointer">
            {triggerText} <Camera />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-white border-amber-50">
          <div className="space-y-6 p-6">
            <div className="flex justify-center">
              <QrCode size={72} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Course Code</p>
                  <span className="font-semibold ">CSC 309</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <span className="font-semibold ">11:30AM</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Course Title</p>
                <span className="font-semibold  uppercase block">
                  Introduction to Python
                </span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MarkPopover;
