import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  QrCode,
  ScanQrCode,
  FileBarChart,
  Users,
  HelpCircle,
  Bell,
  Calendar,
  Trophy,
  AlertCircle,
  Star,
  Target,
  Smile,
  CheckCircle,
  Settings2,
} from "lucide-react";
import rawCardData from "@/components/json/card.json";
import Status from "@/components/lctui/Status";
import Chart from "@/components/general/Chart";
import img1 from "@/assets/images/card/qrb.png";
import img2 from "@/assets/images/card/qrw.png";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Achievement from "@/components/general/Achievement";
import Activity from "@/components/general/Activity";

type CardItem = {
  id: number;
  title: string;
  value: string;
  description: string;
  icon: keyof typeof iconMap;
};

// ✅ Create a proper icon mapping object
const iconMap = {
  QrCode,
  ScanQrCode,
  FileBarChart,
  Users,
  HelpCircle,
  Bell,
  Calendar,
  Trophy,
  AlertCircle,
  Star,
  Target,
  Smile,
  CheckCircle,
};

const cardData: { cards: CardItem[] } = rawCardData as { cards: CardItem[] };
const cardColors = [
  "bg-gradient-to-br from-blue-50 to-indigo-100",
  "bg-gradient-to-br from-orange-50 to-red-100",
  "bg-gradient-to-br from-yellow-50 to-orange-100",
  "bg-gradient-to-br from-purple-50 to-pink-100",
  "bg-gradient-to-br from-green-50 to-emerald-100",
  "bg-gradient-to-br from-teal-50 to-cyan-100",
];

// ✅ Fixed Icon component
const Icon = ({ name }: { name: keyof typeof iconMap }) => {
  const LucideIcon = iconMap[name];
  return LucideIcon ? (
    <LucideIcon className="h-10 w-10 text-primary bg-white text-indigo-500 shadow p-2 rounded-2xl" />
  ) : null;
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const [today, setToday] = useState(() => new Date().toLocaleString());
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(
        new Date().toLocaleString("en-US", {
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8  min-h-screen">
      {/* Enhanced Top Section with Greeting and Quick Stats */}
      <motion.div
        className="relative overflow-hidden "
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white p-4 flex flex-row items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-4xl font-bold mb-1">
              Welcome Back, {user?.matricNumber || user?.name}
            </h1>
            <p className="text-sm md:text-lg">{today}</p>
          </div>
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-26 h-26 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Smile className="h-16 w-16" />
            </div>
          </motion.div>
        </Card>
      </motion.div>

      {/* Hero Card with Flip Animation */}
      <motion.div
        className="grid gap-6 grid-cols-1 lg:grid-cols-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="lg:col-span-2 rounded-3xl bg-white shadow-xl overflow-hidden">
          <div className="md:flex h-full">
            <div
              className="md:w-1/2 relative overflow-hidden"
              onMouseEnter={() => setIsFlipped(true)}
              onMouseLeave={() => setIsFlipped(false)}
            >
              <div
                className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                <img
                  className="absolute backface-hidden h-64 w-full object-cover md:h-full md:w-full"
                  src={img1}
                  alt="A boy with a phone displaying a QR code image in a classroom"
                />
                <img
                  className="backface-hidden transform rotate-y-180 h-64 w-full object-cover md:h-full md:w-full"
                  src={img2}
                  alt="A boy with a phone displaying a QR code image in a classroom"
                />
              </div>
            </div>

            <div className="p-8 flex flex-col justify-center space-y-6">
              <div className="inline-block bg-indigo-100 text-indigo-600 text-sm font-semibold px-4 py-2 rounded-full w-fit">
                <h2>Digital Solution</h2>
              </div>
              <Link
                to={"/dashboard/home"}
                className="block text-2xl leading-tight font-bold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                Smart Attendance Management
              </Link>
              <p className="text-gray-600 leading-relaxed">
                Experience seamless attendance tracking with our advanced
                QR-based system. No more manual processes - just scan, track,
                and succeed!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            Quick Actions
          </h3>
          <div className="space-y-4">
            <motion.button
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-green-500 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <Link to={"/dashboard/scan"}>
                  <p className="font-semibold text-gray-800">Easy Attendance</p>
                  <p className="text-sm text-gray-600">
                    Generate and Scan QR code
                  </p>
                </Link>
              </div>
            </motion.button>

            <motion.button
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-purple-500 p-3 rounded-full">
                <FileBarChart className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <Link to={"/dashboard/attendance"}>
                  <p className="font-semibold text-gray-800">View Reports</p>
                  <p className="text-sm text-gray-600">Attendance stats</p>
                </Link>
              </div>
            </motion.button>

            <motion.button
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-blue-500 p-3 rounded-full">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <Link to={"/dashboard/settings"}>
                  <p className="font-semibold text-gray-800">Settings</p>
                  <p className="text-sm text-gray-600">Quick Settings</p>
                </Link>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: index * 0.1,
            }}
            whileHover={{
              scale: 1,
              y: -5,
              transition: { duration: 0.1 },
            }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card
              className={`${
                cardColors[index % cardColors.length]
              } border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full`}
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-gray-800 mb-2">
                      <h2>{card.title}</h2>
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      <h2>{card.description}</h2>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center px-6 pb-6">
                <p className="text-sm font-bold text-gray-800 mb-2">
                  {card.value}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <div>
                    <Icon name={card.icon} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/*  Charts and Status */}
      <motion.div
        className="grid gap-6 grid-cols-1 lg:grid-cols-2"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          duration: 0.5,
        }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 h-full">
          <Chart />
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-5">
          <Status />
          <Activity />
        </div>
      </motion.div>
      <Achievement />
    </div>
  );
};

export default Home;
