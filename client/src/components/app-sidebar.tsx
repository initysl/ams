import {
  ListCheck,
  Home,
  ScanQrCode,
  Settings,
  QrCodeIcon,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link, NavLink } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import logo from "/at.svg";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());

  // Reset image cache when user data changes
  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

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

  if (!user) return null;

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/dashboard/home",
    },
    ...(user.role === "lecturer"
      ? [
          {
            icon: QrCodeIcon,
            label: "Generate QR",
            path: "/dashboard/generate",
          },
        ]
      : []),
    ...(user.role === "student"
      ? [
          {
            icon: ScanQrCode,
            label: "Scan QR",
            path: "/dashboard/scan",
          },
        ]
      : []),
    {
      icon: ListCheck,
      label: "Attendance",
      path: "/dashboard/attendance",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
    },
  ];

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-slate-200 bg-white min-h-screen w-64"
    >
      <SidebarContent className=" py-2">
        <SidebarGroup>
          {/* Logo Section */}
          <div className="mb-12 flex flex-col items-center text-left space-y-3">
            <SidebarGroupLabel className="text-2xl font-semibold text-slate-800 tracking-wider">
              <div className="sidebar-gl font-semibold tracking-widest flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-lg border border-slate-500 transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={logo}
                    alt="AttendEase Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  AttendEase
                </span>
              </div>
            </SidebarGroupLabel>

            {/* Decorative divider with gradient */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>

          {/* Navigation Menu */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter className="px-4 pb-6 mt-auto">
        {/* User Profile Section */}
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors duration-150">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <img
                    key={imageKey}
                    src={getImageUrl(user?.profilePicture)}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
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
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className="text-slate-400 transition-colors duration-150"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56 bg-white border border-slate-200 shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem className="focus:bg-slate-100 rounded-md">
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm text-slate-700"
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <Separator className="my-1 bg-slate-200" />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-md cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer Text */}
        <div className="px-3">
          <div className="text-sm text-slate-400 text-center font-medium mb-3">
            © {new Date().getFullYear()} TheFirst Studio
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/yusolaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors duration-150"
              aria-label="GitHub"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <a
              href="https://x.com/ysl0xD3v"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors duration-150"
              aria-label="X (Twitter)"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
