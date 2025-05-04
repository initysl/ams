import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "../../assets/images/at.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightCircleIcon } from "lucide-react";

const messages: string[] = [
  "Dive into the world of automated attendance management",
  "Seamlessly track attendance in real-time with just a click.",
  "Say hello to efficiency!",
];

const SplashScreen: React.FC = () => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  const handleGetStated = () => {
    navigate("/auth");
  };
  return (
    <div className="splash-screen flex flex-col items-center justify-center min-h-svh p-4">
      <div className="space-y-6 md:space-y-10">
        {/* Logo and Title */}
        <div className="flex relative bottom-10 md:bottom-0 items-center justify-center">
          <h1 className="text-3xl md:text-3xl font-bold text-green-600">
            AttendEase
          </h1>
        </div>

        <motion.div
          className="rounded-2xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            scale: {
              type: "spring",
              stiffness: 60,
              visualDuration: 0.4,
              bounce: 0.5,
            },
          }}
        >
          <img
            src={logo}
            alt="App logo"
            className="w-full max-w-[280px] md:max-w-sm mx-auto"
          />
        </motion.div>
      </div>
      <div className="space-y-4 md:space-y-5 text-center mt-6">
        <p className="text-base md:text-lg font-bold">
          Your Attendance Management Solution
        </p>

        {/* Animated paragraph with fixed height container */}
        <div className="relative h-[60px] md:h-[30px] flex items-center justify-center px-4">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="font-light text-sm md:text-base text-pretty absolute"
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div>
          <Button
            onClick={handleGetStated}
            className="bg-stone-700 text-white hover:shadow-3xl hover:ease-in-out cursor-pointer"
          >
            Get Started
            <ArrowRightCircleIcon size={10} className="ml-1 animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
