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

const Settings = () => {
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const location = useLocation();

  // Detect route changes to open dialog on mobile
  useEffect(() => {
    if (isMobile && location.pathname !== "/dashboard/settings") {
      setShowMobileDialog(true);
    } else {
      setShowMobileDialog(false);
    }
  }, [location, isMobile]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <Card className="bg-white backdrop-blur-sm shadow-xl md:max-w-xs w-full relative top-10 md:top-0">
        <CardContent>
          <div className="flex flex-col items-center">
            <img
              src={
                user?.profilePicture ||
                `${import.meta.env.VITE_API_URL}images/default.png`
              }
              className="w-32 h-32 rounded-full object-cover"
              alt="profilepic"
              crossOrigin="use-credentials"
            />
            <div className="mt-4 text-center">
              <ul className="space-y-1">
                <li className="font-semibold">{user?.name}</li>
                {user?.role === "lecturer" ? (
                  <li>{user.role}</li>
                ) : user?.role === "student" ? (
                  <li>{user.matricNumber}</li>
                ) : (
                  <li>{user?.role}</li>
                )}
                <li>{user?.email}</li>
              </ul>
            </div>
            <Separator className="bg-stone-200 mt-5" />
            <div className="space-y-4 mt-4 w-full">
              <NavLink
                to="/dashboard/settings/profile"
                className={({ isActive }) =>
                  `flex items-center justify-between w-full p-3 ${
                    isActive ? "bg-gray-100" : ""
                  } hover:bg-gray-100 cursor-pointer rounded-md`
                }
              >
                <div className="flex space-x-2 items-center">
                  <UserPen className="text-green-500 w-5 h-5" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </NavLink>

              <NavLink
                to="/dashboard/settings/about"
                className={({ isActive }) =>
                  `flex items-center justify-between w-full p-3 ${
                    isActive ? "bg-gray-100" : ""
                  } hover:bg-gray-100 cursor-pointer rounded-md`
                }
              >
                <div className="flex space-x-2 items-center">
                  <BadgeHelp className="text-blue-500 w-5 h-5" />
                  <span>About</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </NavLink>

              <NavLink
                to="/dashboard/settings/feedback"
                className={({ isActive }) =>
                  `flex items-center justify-between w-full p-3 ${
                    isActive ? "bg-gray-100" : ""
                  } hover:bg-gray-100 cursor-pointer rounded-md`
                }
              >
                <div className="flex space-x-2 items-center">
                  <MessageCircleQuestion className="text-yellow-500 w-5 h-5" />
                  <span>Feedback</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </NavLink>

              <button
                onClick={logout}
                type="button"
                className="flex space-x-2 items-center w-full p-3 hover:bg-gray-100 cursor-pointer rounded-md"
              >
                <LogOut className="text-red-500 w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Outlet */}
      {!isMobile && (
        <div className="flex-1">
          <Card className="bg-white backdrop-blur-sm shadow-xl h-full">
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile full-screen dialog */}
      {isMobile && (
        <Dialog open={showMobileDialog} onOpenChange={setShowMobileDialog}>
          <DialogContent className="w-full overflow-y-auto bg-white border-none">
            <Outlet />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Settings;
