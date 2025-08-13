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
import { FaInstagram, FaXTwitter, FaGithub } from "react-icons/fa6";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
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
// import logo from "/at.svg";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const { setOpenMobile } = useSidebar();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset image cache when user data changes
  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  // Function to handle navigation click
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
            label: "Generate",
            path: "/dashboard/generate",
          },
        ]
      : []),
    ...(user.role === "student"
      ? [
          {
            icon: ScanQrCode,
            label: "Scan",
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
      <SidebarContent className="py-2">
        <SidebarGroup>
          {/* Logo Section */}
          <div className="mb-12 flex flex-col items-center space-y-3">
            <SidebarGroupLabel className="text-2xl font-semibold text-slate-800 tracking-widest">
              <div className="sidebar-gl font-semibold flex items-center gap-2 group">
                {/* <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-lg border border-slate-500 transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={logo}
                    alt="AttendEase Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div> */}
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
                    onClick={handleNavClick}
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
      <SidebarFooter className="pb-6 mt-auto">
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
              className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-slate-200 shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem className="focus:bg-slate-100 rounded-md">
                <Link
                  to="/dashboard/settings"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm text-slate-700"
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <Separator className="my-1 bg-slate-200" />
              <DropdownMenuItem
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-md cursor-pointer"
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                  logout();
                }}
                tabIndex={0}
                role="button"
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
              <FaGithub size={20} />
            </a>
            <a
              href="https://x.com/yusolaaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors duration-150"
              aria-label="X (Twitter)"
            >
              <FaXTwitter size={20} />
            </a>
            <a
              href="https://instagram.com/yusolaaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors duration-150"
              aria-label="Instagram"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
