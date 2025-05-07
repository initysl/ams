import {
  ListCheck,
  Home,
  ScanQrCode,
  Settings,
  QrCodeIcon,
  ChevronUp,
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
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const { logout, user } = useAuth();
  const { isMobile } = useSidebar();

  if (!user) return null;

  return (
    <Sidebar
      collapsible="offcanvas"
      className={`border-none min-h-screen ${
        isMobile ? "bg-blue-800 text-white" : "bg-stone-800 text-stone-100"
      }`}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-3xl font-bold py-8 mb-5 text-center text-green-400 tracking-widest">
            AttendEase
          </SidebarGroupLabel>
          <Separator className="bg-stone-600 mb-5" />
          <SidebarGroupContent>
            <SidebarMenu className="space-y-5">
              {/* Home */}
              <SidebarMenuItem>
                <NavLink
                  to="/dashboard/home"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-3 transition-transform transform-gpu hover:scale-[1.02] duration-200 rounded-xl ${
                      isActive
                        ? "bg-green-500/90 text-white shadow-xl"
                        : "hover:bg-stone-700 text-stone-300"
                    }`
                  }
                >
                  <Home size={20} />
                  <span>Home</span>
                </NavLink>
              </SidebarMenuItem>

              {/* Lecturer Only: Generate QR Code */}
              {user.role === "lecturer" && (
                <SidebarMenuItem>
                  <NavLink
                    to="/dashboard/generate"
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-3 transition-transform transform-gpu hover:scale-[1.02] duration-200 rounded-xl ${
                        isActive
                          ? "bg-green-500/90 text-white shadow-xl"
                          : "hover:bg-stone-700 text-stone-300"
                      }`
                    }
                  >
                    <QrCodeIcon size={20} />
                    <span>Generate QRCode</span>
                  </NavLink>
                </SidebarMenuItem>
              )}

              {/* Student Only: Scan QR Code */}
              {user.role === "student" && (
                <SidebarMenuItem>
                  <NavLink
                    to="/dashboard/scan"
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-3 transition-transform transform-gpu hover:scale-[1.02] duration-200 rounded-xl ${
                        isActive
                          ? "bg-green-500/90 text-white shadow-xl"
                          : "hover:bg-stone-700 text-stone-300"
                      }`
                    }
                  >
                    <ScanQrCode size={20} />
                    <span>Scan QRCode</span>
                  </NavLink>
                </SidebarMenuItem>
              )}

              {/* Attendance */}
              <SidebarMenuItem>
                <NavLink
                  to="/dashboard/attendance"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-3 transition-transform transform-gpu hover:scale-[1.02] duration-200 rounded-xl ${
                      isActive
                        ? "bg-green-500/90 text-white shadow-xl"
                        : "hover:bg-stone-700 text-stone-300"
                    }`
                  }
                >
                  <ListCheck size={20} />
                  <span>Attendance</span>
                </NavLink>
              </SidebarMenuItem>

              {/* Settings */}
              <SidebarMenuItem>
                <NavLink
                  to="/dashboard/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-3 transition-transform transform-gpu hover:scale-[1.02] duration-200 rounded-xl ${
                      isActive
                        ? "bg-green-500/90 text-white shadow-xl"
                        : "hover:bg-stone-700 text-stone-300"
                    }`
                  }
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuItem>

              {/* User Dropdown */}
              <SidebarFooter className="bg-stone-700 text-white rounded-xl mt-24">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center justify-between p-2 cursor-pointer w-full text-sm font-medium">
                      {user.email}
                      <ChevronUp size={18} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width] bg-white border-none"
                  >
                    <DropdownMenuItem className="hover:bg-green-600 hover:text-white transition-colors duration-200">
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-green-600 hover:text-white transition-colors duration-200">
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                    >
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarFooter>

              {/* Footer note */}
              <SidebarFooter className="mt-2">
                <div className="text-center text-md font-bold text-stone-400">
                  &copy; {new Date().getFullYear()} AttendEase. All rights
                  reserved.
                </div>
              </SidebarFooter>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
