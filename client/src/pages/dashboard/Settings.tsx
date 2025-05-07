import { Outlet, NavLink } from "react-router-dom";
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

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col md:flex-row gap-6 ">
      {/* Sidebar with navigation */}
      <Card className="bg-white md:max-w-xs w-full">
        <CardContent>
          <div>
            <div className="flex flex-col items-center justify-center">
              <img
                src={
                  user?.profilePicture ||
                  `${import.meta.env.VITE_API_URL}images/default.png`
                }
                className="w-32 h-32 rounded-full object-cover"
                alt="profilepic"
              />
              <div className="mt-4 text-center">
                <ul className="space-y-2">
                  <li className="font-semibold">{user?.name}</li>
                  <li className="font-semibold">{user?.matricNumber}</li>
                  <li className="">{user?.email}</li>
                </ul>
              </div>
            </div>
            <Separator className="bg-stone-200 mt-5" />
            <div>
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
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content area - where Outlet will render nested routes */}
      <div className="flex-1">
        <Card className="bg-white h-full">
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
