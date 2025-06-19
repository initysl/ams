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
      className="border-r rounded-r-xl border-white bg-white shadow-xl min-h-screen w-64"
    >
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          {/* Logo Section */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <SidebarGroupLabel className="sidebar-gl text-2xl md:text-4xl font-bold text-gray-900 mb-1 tracking-widest">
              AttendEase
            </SidebarGroupLabel>
          </div>

          {/* Navigation Menu */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-8">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <item.icon
                      size={20}
                      className="flex-shrink-0 transition-colors duration-200"
                    />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter className="px-3 pb-6">
        {/* User Profile Section */}
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors duration-200 group">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.email.split("@")[0]}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2 w-full"
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer Text */}
        <div className="px-3">
          <div className="text-sm font-semibold text-gray-400 text-center">
            © {new Date().getFullYear()} AttendEase
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
