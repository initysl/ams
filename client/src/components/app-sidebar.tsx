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
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const { logout } = useAuth();

  const { isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return null;
  }

  // Helper function to check if a path is active
  const isActive = (path: string) =>
    location.pathname.includes(`/dashboard/${path}`);

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
              {/* Home Link */}
              <SidebarMenuItem
                className={`p-2 transition-transform transform-gpu hover:scale-[1.02] duration-200 ${
                  isActive("home")
                    ? "bg-green-500/90 text-white shadow-xl rounded-xl"
                    : "hover:bg-stone-700 text-stone-300 rounded-xl"
                }`}
              >
                <SidebarMenuButton asChild isActive={isActive("home")}>
                  <Link
                    to="/dashboard/home"
                    className="flex items-center gap-2"
                  >
                    <Home size={20} />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Role-specific links */}
              {user.role === "lecturer" && (
                <SidebarMenuItem
                  className={`p-2 transition-transform transform-gpu hover:scale-[1.02] duration-200 ${
                    isActive("generate")
                      ? "bg-green-500/90 text-white shadow-xl rounded-xl"
                      : "hover:bg-stone-700 text-stone-300 rounded-xl"
                  }`}
                >
                  <SidebarMenuButton asChild isActive={isActive("generate")}>
                    <Link
                      to="/dashboard/generate"
                      className="flex items-center gap-2"
                    >
                      <QrCodeIcon size={20} />
                      <span>Generate QRCode</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {user.role === "student" && (
                <SidebarMenuItem
                  className={`p-2 transition-transform transform-gpu hover:scale-[1.02] duration-200 ${
                    isActive("scan")
                      ? "bg-green-500/90 text-white shadow-xl rounded-xl"
                      : "hover:bg-stone-700 text-stone-300 rounded-xl"
                  }`}
                >
                  <SidebarMenuButton asChild isActive={isActive("scan")}>
                    <Link
                      to="/dashboard/scan"
                      className="flex items-center gap-2"
                    >
                      <ScanQrCode size={20} />
                      <span>Scan QRCode</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Attendance Link */}
              <SidebarMenuItem
                className={`p-2 transition-transform transform-gpu hover:scale-[1.02] duration-200 ${
                  isActive("attendance")
                    ? "bg-green-500/90 text-white shadow-xl rounded-xl"
                    : "hover:bg-stone-700 text-stone-300 rounded-xl"
                }`}
              >
                <SidebarMenuButton asChild isActive={isActive("attendance")}>
                  <Link
                    to="/dashboard/attendance"
                    className="flex items-center gap-2"
                  >
                    <ListCheck size={20} />
                    <span>Attendance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings Link */}
              <SidebarMenuItem
                className={`p-2 transition-transform transform-gpu hover:scale-[1.02] duration-200 ${
                  isActive("settings")
                    ? "bg-green-500/90 text-white shadow-xl rounded-xl"
                    : "hover:bg-stone-700 text-stone-300 rounded-xl"
                }`}
              >
                <SidebarMenuButton asChild isActive={isActive("settings")}>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2"
                  >
                    <Settings size={20} />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Footer */}
              <SidebarFooter className="bg-stone-700 text-white rounded-xl mt-24">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2 p-2 w-full text-sm font-medium text-ellipsis">
                      {user.email}
                      <ChevronUp className="" size={18} />
                    </SidebarMenuButton>
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
                      className="hover:bg-green-600 hover:text-white transition-colors duration-200"
                      onClick={logout}
                    >
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarFooter>
              <SidebarFooter className="mt-2">
                <div>
                  <div className="text-center text-md font-bold text-stone-400">
                    &copy; {new Date().getFullYear()} AttendEase. All rights
                    reserved.
                  </div>
                </div>
              </SidebarFooter>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
