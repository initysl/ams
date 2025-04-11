import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "../../assets/images/at.png";
import { useEffect, useState } from "react";

const messages: string[] = [
  "Dive into the world of automated attendance management",
  "Say goodbye to manual records and hello to efficiency!",
  "Seamlessly track attendance in real-time with just a click.",
];

const SplashScreen: React.FC = () => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-screen space-y-4 flex flex-col items-center justify-center min-h-svh">
      {/* Logo and Title */}
      <div className="relative -top-7 ">
        <h1 className="text-3xl font-bold text-green-600 ">AttendEase</h1>
      </div>
      <motion.div
        className="rounded-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          scale: {
            type: "spring",
            stiffness: 100,
            visualDuration: 0.4,
            bounce: 0.5,
          },
        }}
      >
        <img src={logo} alt="App logo" className="max-w-sm" />
      </motion.div>
      <div className="text-center text-pretty space-y-4">
        <p className="text-lg font-bold">Your Attendance Management Solution</p>

        {/* Animated paragraph */}
        <AnimatePresence mode="popLayout">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="font-light"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>

        <Button className="bg-green-600 hover:bg-green-800 hover:ease-in-out text-white cursor-pointer">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default SplashScreen;
