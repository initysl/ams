import {
  ListCheck,
  Home,
  ScanQrCode,
  Settings,
  QrCodeIcon,
  User2,
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

// Menu items.
const commonItems = [
  {
    title: "Home",
    url: "home",
    icon: Home,
  },
  {
    title: "Attendance",
    url: "attendance",
    icon: ListCheck,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
];

const lecturerItems = [
  {
    title: "Generate QRCode",
    url: "generate",
    icon: QrCodeIcon,
  },
];

const studentItems = [
  {
    title: "Scan QrCode",
    url: "scan",
    icon: ScanQrCode,
  },
];

export function AppSidebar() {
  const { isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return null;
  }

  // Determine which items to show based on user role
  const isActive = (item: { url: string }) =>
    location.pathname.includes(`/dashboard/${item.url}`);

  // Combine common items with role-specific items
  const displayItems = [
    ...commonItems,
    ...(user.role === "lecturer" ? lecturerItems : []),
    ...(user.role === "student" ? studentItems : []),
  ];
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
              {displayItems.map((item) => {
                const active = isActive(item);

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={`p-2 transition-transform transform-gpu hover:scale-[1.02] duration-200 ${
                      active
                        ? "bg-green-500/90 text-white shadow-xl rounded-xl"
                        : "hover:bg-stone-700 text-stone-300 rounded-xl"
                    }`}
                  >
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={`/dashboard/${item.url}`}
                        className="flex items-center gap-2"
                      >
                        <item.icon size={20} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Footer */}
              <SidebarFooter className="bg-stone-700 text-white rounded-xl mt-24">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2 p-2 w-full text-sm font-medium text-ellipsis">
                      <img
                        src={user.profilePic ?? "/images/default.png"}
                        alt="Profile"
                        className="w-6 h-6 rounded-full"
                      />
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
                    <DropdownMenuItem className="hover:bg-green-600 hover:text-white transition-colors duration-200">
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarFooter>
              <SidebarFooter className="mt-2">
                <div>
                  {/* <div className="flex justify-between items-center px-4 py-2">
                    <Link to="https://twitter.com" className="text-stone-400 hover:text-white">
                      <X size={18} />
                    </Link>
                    <Link to="https://github.com" className="text-stone-400 hover:text-white">
                      <GitCommitHorizontal size={18} />
                    </Link>
                    <Link to="https://linkedin.com" className="text-stone-400 hover:text-white">
                      < size={18} />
                    </Link>
                    </div> */}
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
