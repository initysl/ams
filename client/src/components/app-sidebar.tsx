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

// Menu items.
const items = [
  {
    title: "Home",
    url: "home",
    icon: Home,
  },
  {
    title: "Generate QRCode",
    url: "generate",
    icon: QrCodeIcon,
  },
  {
    title: "Attendance",
    url: "attendance",
    icon: ListCheck,
  },
  {
    title: "Scan QrCode",
    url: "scan",
    icon: ScanQrCode,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  // const { isMobile } = useSidebar();
  const location = useLocation(); // 🟢 useLocation instead of window.location
  const isActive = (item: { url: string }) =>
    location.pathname.includes(`/dashboard/${item.url}`);

  return (
    <Sidebar className="bg-stone-600">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="bg-white text-xl font-bold p-8 mb-10">
            AttendEase
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-white space-y-5">
              {items.map((item) => {
                const active = isActive(item);

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={`rounded-sm transition-colors duration-200 ${
                      active
                        ? " text-white hover:bg-stone-800 bg-stone-800 hover:text-white"
                        : "text-white  hover:text-gray-200 hover:bg-stone-800 transition-all duration-200 rounded-sm "
                    }`}
                  >
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={`/dashboard/${item.url}`}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarFooter className="fixed bottom-0 left-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <User2 /> Username
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width] bg-white border-none"
                  >
                    <DropdownMenuItem className="hover:bg-stone-800 hover:text-white transition-colors duration-200">
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-stone-800 hover:text-white transition-colors duration-200">
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-stone-800 hover:text-white transition-colors duration-200">
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarFooter>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
