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

export function AppSidebar() {
  const { logout, user } = useAuth();

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
      <SidebarContent className="px-4 py-8">
        <SidebarGroup>
          {/* Logo Section */}
          <div className="mb-12 flex flex-col items-center justify-center">
            <SidebarGroupLabel className="text-2xl font-semibold text-slate-800 mb-2 tracking-tight">
              AttendEase
            </SidebarGroupLabel>
            <div className="w-12 h-0.5 bg-slate-300 rounded-full"></div>
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
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors duration-150">
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {user.email.split("@")[0]}
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
          <div className="text-xs text-slate-400 text-center font-medium">
            © {new Date().getFullYear()} AttendEase
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
