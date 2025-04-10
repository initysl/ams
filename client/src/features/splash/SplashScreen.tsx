import { Button } from "@/components/ui/button";
import logo from "../../assets/images/at.png";
import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen space-y-4 flex flex-col items-center justify-center min-h-svh">
      {/* Logo and Title */}
      <div className="fixed top-5">
        <h1 className="text-3xl font-bold text-green-600 mb-4">AttendEase</h1>
      </div>
      <div className="mt-5 lg:mt-10">
        <img src={logo} alt="App logo" className="max-w-sm" />
      </div>
      <div className="text-center mt-4 lg:mt-0">
        <p className="text-lg font-bold mb-4">
          Your attendance management solution{" "}
        </p>
        <p className="font-light">
          Get ready to dive in the life of automated attendance management
        </p>

        {/* Buttons */}
        <div>
          <Button className="bg-green-600 text-white mt-10 cursor-pointer">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
