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
  const isSmallMobile = useMediaQuery("(max-width: 480px)");
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
    if (!profilePicture) {
      // Return default image from your server's public folder
      const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
      return `${baseUrl}/api/images/default.png?t=${imageKey}`;
    }

    // If it's a Cloudinary URL (starts with https://res.cloudinary.com), return it directly
    if (profilePicture.startsWith("https://res.cloudinary.com")) {
      return profilePicture;
    }

    // If it's any other full URL, return it with cache buster
    if (profilePicture.startsWith("http")) {
      return `${profilePicture}?t=${imageKey}`;
    }

    // For backward compatibility with old local files (if any exist)
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}${profilePicture}?t=${imageKey}`;
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
    <div className="flex flex-col md:flex-row md:gap-6 md:min-h-0">
      {/* Sidebar with motion */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`
          bg-white backdrop-blur-sm shadow-xl rounded-xl
          ${
            isMobile
              ? "w-full min-h-[600px] flex flex-col"
              : "md:max-w-xs w-full"
          }
        `}
      >
        {/* Sidebar Profile */}
        <CardContent
          className={`${
            isMobile ? "p-4 flex-1 flex flex-col justify-center" : "p-6"
          }`}
        >
          <div
            className={`flex flex-col items-center ${
              isMobile ? "h-full justify-center" : ""
            }`}
          >
            {/* Profile Image */}
            <motion.div
              variants={profileImageVariants}
              whileHover="hover"
              className={`relative ${isMobile ? "mb-6" : "mb-3"}`}
            >
              <img
                key={imageKey}
                src={getImageUrl(user?.profilePicture)}
                className={`
                  rounded-full object-cover ring-4 ring-white shadow-lg
                  ${
                    isSmallMobile
                      ? "w-28 h-28"
                      : isMobile
                      ? "w-32 h-32"
                      : "w-32 h-32"
                  }
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
              <div
                className={`
                absolute bottom-0 right-0 bg-green-500 rounded-full ring-2 ring-white
                ${isSmallMobile ? "w-5 h-5" : "w-6 h-6"}
              `}
              ></div>
            </motion.div>

            {/* User Info */}
            <div className={`text-center ${isMobile ? "mb-8" : "mb-4"}`}>
              <div className="">
                <h3
                  className={`
                  font-bold text-gray-900 leading-tight
                  ${
                    isSmallMobile
                      ? "text-xl"
                      : isMobile
                      ? "text-2xl"
                      : "text-xl"
                  }
                `}
                >
                  {user?.name}
                </h3>

                <p
                  className={`
                  text-gray-500 font-medium
                  ${
                    isSmallMobile
                      ? "text-sm"
                      : isMobile
                      ? "text-base"
                      : "text-base"
                  }
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
                  ${
                    isSmallMobile
                      ? "text-sm px-2"
                      : isMobile
                      ? "text-base px-2"
                      : "text-sm"
                  }
                `}
                >
                  {user?.email}
                </p>
              </div>
            </div>

            <Separator
              className={`bg-gray-200 w-full ${isMobile ? "mb-6" : "mb-4"}`}
            />

            {/* Navigation Menu */}
            <nav className="w-full">
              <div
                className={`space-y-2 ${isMobile ? "space-y-3" : "space-y-1"}`}
              >
                <motion.div variants={navItemVariants} whileHover="hover">
                  <NavLink
                    to="/dashboard/settings/profile"
                    className={({ isActive }) =>
                      `flex items-center justify-between w-full rounded-lg transition-all duration-200 ${
                        isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-3"
                      } ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <UserPen
                        className={`
                        text-green-500 flex-shrink-0
                        ${
                          isSmallMobile
                            ? "w-5 h-5"
                            : isMobile
                            ? "w-6 h-6"
                            : "w-5 h-5"
                        }
                      `}
                      />
                      <span
                        className={`
                        font-medium
                        ${
                          isSmallMobile
                            ? "text-base"
                            : isMobile
                            ? "text-lg"
                            : "text-base"
                        }
                      `}
                      >
                        Profile
                      </span>
                    </div>
                    <ChevronRight
                      className={`
                      text-gray-400 flex-shrink-0
                      ${
                        isSmallMobile
                          ? "w-5 h-5"
                          : isMobile
                          ? "w-5 h-5"
                          : "w-4 h-4"
                      }
                    `}
                    />
                  </NavLink>
                </motion.div>

                <motion.div variants={navItemVariants} whileHover="hover">
                  <NavLink
                    to="/dashboard/settings/about"
                    className={({ isActive }) =>
                      `flex items-center justify-between w-full rounded-lg transition-all duration-200 ${
                        isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-3"
                      } ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <BadgeHelp
                        className={`
                        text-blue-500 flex-shrink-0
                        ${
                          isSmallMobile
                            ? "w-5 h-5"
                            : isMobile
                            ? "w-6 h-6"
                            : "w-5 h-5"
                        }
                      `}
                      />
                      <span
                        className={`
                        font-medium
                        ${
                          isSmallMobile
                            ? "text-base"
                            : isMobile
                            ? "text-lg"
                            : "text-base"
                        }
                      `}
                      >
                        About
                      </span>
                    </div>
                    <ChevronRight
                      className={`
                      text-gray-400 flex-shrink-0
                      ${
                        isSmallMobile
                          ? "w-5 h-5"
                          : isMobile
                          ? "w-5 h-5"
                          : "w-4 h-4"
                      }
                    `}
                    />
                  </NavLink>
                </motion.div>

                <motion.div variants={navItemVariants} whileHover="hover">
                  <NavLink
                    to="/dashboard/settings/feedback"
                    className={({ isActive }) =>
                      `flex items-center justify-between w-full rounded-lg transition-all duration-200 ${
                        isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-3"
                      } ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircleQuestion
                        className={`
                        text-yellow-500 flex-shrink-0
                        ${
                          isSmallMobile
                            ? "w-5 h-5"
                            : isMobile
                            ? "w-6 h-6"
                            : "w-5 h-5"
                        }
                      `}
                      />
                      <span
                        className={`
                        font-medium
                        ${
                          isSmallMobile
                            ? "text-base"
                            : isMobile
                            ? "text-lg"
                            : "text-base"
                        }
                      `}
                      >
                        Feedback
                      </span>
                    </div>
                    <ChevronRight
                      className={`
                      text-gray-400 flex-shrink-0
                      ${
                        isSmallMobile
                          ? "w-5 h-5"
                          : isMobile
                          ? "w-5 h-5"
                          : "w-4 h-4"
                      }
                    `}
                    />
                  </NavLink>
                </motion.div>

                <Separator
                  className={`bg-gray-200 ${isMobile ? "my-4" : "my-2"}`}
                />

                <motion.div variants={navItemVariants} whileHover="hover">
                  <button
                    onClick={logout}
                    type="button"
                    className={`
                      flex items-center w-full rounded-lg transition-all duration-200
                      hover:bg-red-50 text-gray-700 hover:text-red-600
                      ${isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-3"}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut
                        className={`
                        text-red-500 flex-shrink-0
                        ${
                          isSmallMobile
                            ? "w-5 h-5"
                            : isMobile
                            ? "w-6 h-6"
                            : "w-5 h-5"
                        }
                      `}
                      />
                      <span
                        className={`
                        font-medium
                        ${
                          isSmallMobile
                            ? "text-base"
                            : isMobile
                            ? "text-lg"
                            : "text-base"
                        }
                      `}
                      >
                        Sign Out
                      </span>
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
            <CardContent className="h-full p-6">
              <Outlet />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mobile full-screen dialog */}
      {isMobile && (
        <Dialog open={showMobileDialog} onOpenChange={setShowMobileDialog}>
          {/* Readd h-full if continue overlapping */}
          <DialogContent className="w-full space-y-8 m-0 p-0 overflow-y-auto bg-white border-none rounded-xl">
            <div className={`${isSmallMobile ? "p-3" : "p-4"}`}>
              <Outlet />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Settings;
