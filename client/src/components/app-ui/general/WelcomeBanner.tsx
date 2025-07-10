import React from "react";
import { motion } from "framer-motion";
import { Smile, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

// Quick stats component
type ConfigType = {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  textColor: string;
  avatarBg: string;
  shadowColor: string;
  borderColor: string;
};

const Card = ({ children, className }: CardProps) => (
  <div className={`rounded-3xl  ${className}`}>{children}</div>
);

// Floating background elements component
const FloatingElements = ({ config }: { config: ConfigType }) => {
  const elements = [
    { id: 1, size: "w-3 h-3", delay: 0, duration: 4 },
    { id: 2, size: "w-2 h-2", delay: 1, duration: 5 },
    { id: 3, size: "w-4 h-4", delay: 2, duration: 3 },
    { id: 4, size: "w-2 h-2", delay: 0.5, duration: 6 },
    { id: 5, size: "w-3 h-3", delay: 1.5, duration: 4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={element.id}
          className={`
            absolute rounded-full opacity-20
            ${config.iconBg}
            ${element.size}
          `}
          style={{
            left: `${20 + index * 15}%`,
            top: `${10 + index * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const WelcomeBanner = () => {
  const { user } = useAuth();

  const currentDate = new Date();
  const timeOfDay = currentDate.getHours();

  const greeting =
    timeOfDay < 12
      ? "Good Morning"
      : timeOfDay < 17
      ? "Good Afternoon"
      : "Good Evening";

  // Time-based styling configurations with white/gray background
  const timeConfig = {
    morning: {
      icon: Sun,
      iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
      iconColor: "text-white",
      cardBg: "bg-white",
      textColor: "text-gray-800",
      avatarBg: "bg-blue-500",
      shadowColor: "shadow-gray-200",
      borderColor: "border-gray-200",
    },
    afternoon: {
      icon: Sun,
      iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
      iconColor: "text-white",
      cardBg: "bg-white",
      textColor: "text-gray-800",
      avatarBg: "bg-blue-500",
      shadowColor: "shadow-gray-200",
      borderColor: "border-gray-200",
    },
    evening: {
      icon: Moon,
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      iconColor: "text-white",
      cardBg: "bg-white",
      textColor: "text-gray-800",
      avatarBg: "bg-blue-500",
      shadowColor: "shadow-gray-200",
      borderColor: "border-gray-200",
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
        className={`${currentConfig.cardBg} ${currentConfig.shadowColor} shadow-lg border ${currentConfig.borderColor} p-6 flex flex-row items-center justify-between relative overflow-hidden rounded-3xl`}
      >
        {/* Floating background elements */}
        <FloatingElements config={currentConfig} />

        {/* Main content */}
        <div className="space-y-4 relative z-10 flex-1">
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
                  text-2xl md:text-3xl 
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
                {user?.matricNumber || user?.name || "Welcome User"}
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Quick stats - hidden on mobile, shown on large screens */}

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
