import React from "react";
import { motion } from "framer-motion";
import { Smile, Sun, Cloud, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>
);

const WelcomeBanner: React.FC = () => {
  const { user } = useAuth();

  const currentDate = new Date();
  const timeOfDay = currentDate.getHours();

  const greeting =
    timeOfDay < 12
      ? "Good Morning"
      : timeOfDay < 17
      ? "Good Afternoon"
      : "Good Evening";

  // Time-based styling configurations
  const timeConfig = {
    morning: {
      icon: Sun,
      iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50",
      textColor: "text-orange-900",
      avatarBg: "bg-gradient-to-br from-orange-400 to-yellow-500",
      shadowColor: "shadow-orange-200/50",
      borderColor: "border-orange-100",
    },
    afternoon: {
      icon: Cloud,
      iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50",
      textColor: "text-blue-900",
      avatarBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-200/50",
      borderColor: "border-blue-100",
    },
    evening: {
      icon: Moon,
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50",
      textColor: "text-indigo-900",
      avatarBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      shadowColor: "shadow-purple-200/50",
      borderColor: "border-purple-100",
    },
  };

  const currentConfig =
    timeOfDay < 12
      ? timeConfig.morning
      : timeOfDay < 17
      ? timeConfig.afternoon
      : timeConfig.evening;

  const TimeIcon = currentConfig.icon;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        className={`${currentConfig.cardBg} ${currentConfig.shadowColor} shadow-xl border ${currentConfig.borderColor} p-6 flex flex-row items-center justify-between relative overflow-hidden`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="space-y-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            {/* Time-based icon with proper styling */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className={`
                ${currentConfig.iconBg} 
                ${currentConfig.iconColor} 
                p-3 rounded-full 
                shadow-lg 
                ${currentConfig.shadowColor}
                relative
              `}
            >
              <TimeIcon className="h-8 w-8 md:h-10 md:w-10" />

              {/* Add a subtle glow effect */}
              <div
                className={`
                absolute inset-0 
                ${currentConfig.iconBg} 
                rounded-full 
                blur-md 
                opacity-30 
                -z-10
              `}
              ></div>
            </motion.div>

            {/* Greeting text */}
            <div className="space-y-1">
              <motion.h1
                className={`
                  text-xl md:text-4xl 
                  font-bold 
                  ${currentConfig.textColor}
                  leading-tight
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {greeting}!
              </motion.h1>

              <motion.p
                className={`
                  text-lg md:text-2xl 
                  font-semibold 
                  ${currentConfig.textColor}
                  opacity-80
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {user?.matricNumber || user?.name}
              </motion.p>
            </div>
          </motion.div>

          {/* Time display */}
          {/* <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`
              text-sm 
              ${currentConfig.textColor}
              opacity-70 
              font-medium
            `}
          >
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            •{" "}
            {currentDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </motion.div> */}
        </div>

        {/* Avatar with time-based styling */}
        <motion.div
          className="hidden md:block relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <div
              className={`
              w-20 h-20 lg:w-24 lg:h-24 
              ${currentConfig.avatarBg} 
              rounded-full 
              flex 
              items-center 
              justify-center 
              text-white 
              shadow-xl
              ${currentConfig.shadowColor}
              border-4 
              border-white/30
            `}
            >
              <Smile className="h-10 w-10 lg:h-12 lg:w-12" />
            </div>

            {/* Pulsing ring effect */}
            <motion.div
              className={`
                absolute 
                inset-0 
                ${currentConfig.avatarBg} 
                rounded-full 
                opacity-20
              `}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default WelcomeBanner;
