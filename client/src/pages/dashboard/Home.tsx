import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  QrCode,
  FileBarChart,
  Users,
  HelpCircle,
  Smile,
  CheckCircle,
  Settings2,
  ListCheck,
  ScanQrCode,
  Smartphone,
  TabletSmartphone,
  CalendarCheck2,
} from "lucide-react";
import Status from "@/components/app-ui/lct/Status";
import Chart from "@/components/app-ui/general/Chart";
import img1 from "@/assets/images/card/qrb.png";
import img2 from "@/assets/images/card/qrw.png";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Activity from "@/components/app-ui/general/Activity";
import Achievement from "@/components/app-ui/general/Achievement";

const cardData = {
  cards: [
    {
      id: 1,
      title: "Smart Attendance Management System",
      value: "Instant Digital Check-ins",
      description:
        "Generate dynamic QR codes instantly for students to mark attendance effortlessly.",
      icon: <QrCode className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      id: 2,
      title: "Insightful Attendance Report Analytics",
      value: "Trends And Data Analytics",
      description:
        "Access detailed attendance reports that help monitor student patterns effectively.",
      icon: <FileBarChart className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      id: 3,
      title: "User-Friendly Interface Design Experience",
      value: "Simple And Easy Navigation",
      description:
        "Simplified dashboard interface designed for seamless attendance.",
      icon: <Users className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      id: 4,
      title: "Help And Support Center Page",
      value: "Customer Service And Feedback",
      description:
        "Get comprehensive help support and send feedback for continuous improvement.",
      icon: <HelpCircle className="w-5 h-5" />,
      gradient: "from-rose-500 to-pink-400",
    },
  ],
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
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white p-4 flex flex-row items-center justify-between relative">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold mb-1">
              Welcome Back, {user?.matricNumber || user?.name}
            </h1>
            <p className="text-xl md:text-lg">{today}</p>
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

        {/* Scattered Background Icons */}
        <div className="md:hidden absolute inset-0 z-10 pointer-events-none">
          <ListCheck className="absolute top-12 left-90 h-10 w-10 text-teal-300 opacity-50 -rotate-45" />
          <ScanQrCode className="absolute bottom-8 left-12 h-10 w-10 text-gray-200 opacity-50 rotate-45" />
          <Smartphone className="absolute top-1/2 right-40 h-10 w-10 text-gray-300 opacity-50 -rotate-12" />
          <TabletSmartphone className="absolute bottom-4 right-8 h-9 w-9 text-gray-200 rotate-90" />
          <CalendarCheck2 className="absolute top-4 right-4 h-6 w-6 text-purple-300 opacity-50 -rotate-30" />
        </div>
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

      {/* Enhanced Stats Cards - FIXED */}
      <motion.div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {cardData.cards.map((card, index) => (
          <motion.div
            key={card.id}
            className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.9 + index * 0.1,
            }}
            whileHover={{
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            {/* Gradient background on hover */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl bg-gradient-to-br ${card.gradient} transition-opacity duration-500`}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                >
                  {card.icon}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-gray-600 group-hover:text-white/90 text-sm mb-3 transition-colors duration-300">
                {card.description}
              </p>
              <div className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors duration-300">
                {card.value}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/*  Charts and Status */}
      <motion.div
        className="grid gap-6 grid-cols-1 lg:grid-cols-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 h-full">
          <Chart />
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-5">
          <Status />
          {user?.role === "lecturer" ? <Activity /> : <Achievement />}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
