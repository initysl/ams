import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import {
  BadgeHelp,
  ChevronRight,
  LogOut,
  MessageCircleQuestion,
  UserPen,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Settings = () => {
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const location = useLocation();

  // Reset image cache when user data changes
  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  // Detect route changes to open dialog on mobile
  useEffect(() => {
    if (isMobile && location.pathname !== "/dashboard/settings") {
      setShowMobileDialog(true);
    } else {
      setShowMobileDialog(false);
    }
  }, [location, isMobile]);

  // Function to get the correct image URL with cache busting
  const getImageUrl = (profilePicture: string | null | undefined) => {
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api/", "");

    if (!profilePicture) {
      const defaultUrl = `${baseUrl}/images/default.png?t=${imageKey}`;
      return defaultUrl;
    }

    if (profilePicture.startsWith("http")) {
      return `${profilePicture}?t=${imageKey}`;
    }

    const fullUrl = `${baseUrl}${profilePicture}?t=${imageKey}`;
    return fullUrl;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const outletVariants = {
    hidden: { opacity: 0, x: 8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2,
      },
    },
  };

  const profileImageVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const navItemVariants = {
    hover: {
      x: 4,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 min-h-screen lg:min-h-0">
      {/* Sidebar with motion */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`
          bg-white backdrop-blur-sm shadow-xl rounded-xl
          ${isMobile ? "w-full h-screen" : "md:max-w-xs w-full"}
        `}
      >
        {/* Sidebar Profile */}
        <CardContent className={isMobile ? "h-full w-full flex flex-col" : ""}>
          <div
            className={`
              flex flex-col items-center 
              ${isMobile ? "flex-1 justify-center py-8" : "py-5"}
            `}
          >
            {/* Profile Image */}
            <motion.div
              variants={profileImageVariants}
              whileHover="hover"
              className="relative"
            >
              <img
                key={imageKey}
                src={getImageUrl(user?.profilePicture)}
                className={`
                  rounded-full object-cover ring-4 ring-white shadow-lg
                  ${isMobile ? "w-32 h-32 sm:w-36 sm:h-36" : "w-32 h-32"}
                `}
                alt="Profile picture"
                crossOrigin="use-credentials"
                onError={(e) => {
                  const baseUrl = import.meta.env.VITE_API_URL.replace(
                    "/api/",
                    ""
                  );
                  (
                    e.target as HTMLImageElement
                  ).src = `${baseUrl}/api/images/default.png?t=${Date.now()}`;
                }}
              />
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white"></div>
            </motion.div>

            {/* User Info */}
            <div className={`text-center ${isMobile ? "mt-6 mb-8" : "mt-4"}`}>
              <div className="space-y-2">
                <h3
                  className={`
                    font-bold text-gray-900 leading-tight
                    ${isMobile ? "text-2xl" : "text-xl"}
                  `}
                >
                  {user?.name}
                </h3>

                <p
                  className={`
                    text-gray-600 font-medium
                    ${isMobile ? "text-lg" : "text-base"}
                  `}
                >
                  {user?.role === "lecturer" ? (
                    <span className="capitalize">{user.role}</span>
                  ) : user?.role === "student" ? (
                    <span>{user.matricNumber}</span>
                  ) : (
                    <span className="capitalize">{user?.role}</span>
                  )}
                </p>

                <p
                  className={`
                    text-gray-500 break-all
                    ${isMobile ? "text-base px-4" : "text-sm"}
                  `}
                >
                  {user?.email}
                </p>
              </div>
            </div>

            <Separator
              className={`bg-gray-200 ${isMobile ? "w-full mb-8" : "mt-5"}`}
            />

            {/* Navigation Menu */}
            <nav className={`w-full ${isMobile ? "flex-1" : "mt-4"}`}>
              <div
                className={`
                  ${isMobile ? "space-y-4 flex flex-col h-full" : "space-y-2"}
                `}
              >
                <motion.div variants={navItemVariants} whileHover="hover">
                  <NavLink
                    to="/dashboard/settings/profile"
                    className={({ isActive }) =>
                      `flex items-center justify-between w-full rounded-lg transition-all duration-200 ${
                        isMobile ? "p-4 text-lg" : "p-3"
                      } ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <UserPen
                        className={`text-green-500 ${
                          isMobile ? "w-6 h-6" : "w-5 h-5"
                        }`}
                      />
                      <span className="font-medium">Profile</span>
                    </div>
                    <ChevronRight
                      className={`text-gray-400 ${
                        isMobile ? "w-5 h-5" : "w-5 h-5"
                      }`}
                    />
                  </NavLink>
                </motion.div>

                <motion.div variants={navItemVariants} whileHover="hover">
                  <NavLink
                    to="/dashboard/settings/about"
                    className={({ isActive }) =>
                      `flex items-center justify-between w-full rounded-lg transition-all duration-200 ${
                        isMobile ? "p-4 text-lg" : "p-3"
                      } ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <BadgeHelp
                        className={`text-blue-500 ${
                          isMobile ? "w-6 h-6" : "w-5 h-5"
                        }`}
                      />
                      <span className="font-medium">About</span>
                    </div>
                    <ChevronRight
                      className={`text-gray-400 ${
                        isMobile ? "w-5 h-5" : "w-5 h-5"
                      }`}
                    />
                  </NavLink>
                </motion.div>

                <motion.div variants={navItemVariants} whileHover="hover">
                  <NavLink
                    to="/dashboard/settings/feedback"
                    className={({ isActive }) =>
                      `flex items-center justify-between w-full rounded-lg transition-all duration-200 ${
                        isMobile ? "p-4 text-lg" : "p-3"
                      } ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <MessageCircleQuestion
                        className={`text-yellow-500 ${
                          isMobile ? "w-6 h-6" : "w-5 h-5"
                        }`}
                      />
                      <span className="font-medium">Feedback</span>
                    </div>
                    <ChevronRight
                      className={`text-gray-400 ${
                        isMobile ? "w-5 h-5" : "w-5 h-5"
                      }`}
                    />
                  </NavLink>
                </motion.div>

                <Separator className="bg-gray-200 my-2" />

                <motion.div variants={navItemVariants} whileHover="hover">
                  <button
                    onClick={logout}
                    type="button"
                    className={`
                      flex items-center w-full rounded-lg transition-all duration-200
                      hover:bg-red-50 text-gray-700 hover:text-red-600
                      ${isMobile ? "p-4 text-lg" : "p-3"}
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <LogOut
                        className={`text-red-500 ${
                          isMobile ? "w-6 h-6" : "w-5 h-5"
                        }`}
                      />
                      <span className="font-medium">Sign Out</span>
                    </div>
                  </button>
                </motion.div>
              </div>
            </nav>
          </div>
        </CardContent>
      </motion.div>

      {/* Desktop Outlet with motion */}
      {!isMobile && (
        <motion.div
          className="flex-1 min-h-0"
          variants={outletVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white backdrop-blur-sm shadow-xl h-full">
            <CardContent className="h-full">
              <Outlet />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mobile full-screen dialog */}
      {isMobile && (
        <Dialog open={showMobileDialog} onOpenChange={setShowMobileDialog}>
          <DialogContent className="w-full h-full max-w-none max-h-none m-0 p-0 overflow-y-auto bg-white border-none rounded-none">
            <div className="p-4">
              <Outlet />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Settings;
