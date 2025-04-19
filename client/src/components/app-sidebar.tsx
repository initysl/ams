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
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "./ui/separator";

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
  const location = useLocation();
  const isActive = (item: { url: string }) =>
    location.pathname.includes(`/dashboard/${item.url}`);

  return (
    <Sidebar className="bg-stone-800 text-stone-100 border-none min-h-screen">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-3xl font-bold py-8 mb-5 text-center text-green-400 tracking-widest">
            AttendEase
          </SidebarGroupLabel>
          <Separator className="bg-stone-600 mb-5" />
          <SidebarGroupContent>
            <SidebarMenu className="space-y-5">
              {items.map((item) => {
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
              <SidebarFooter className="bg-stone-700 text-white rounded-xl mt-28">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2 p-2 w-full text-sm font-medium">
                      <User2 size={18} />
                      lawalysl356@gmail.com
                      <ChevronUp className="ml-auto" size={18} />
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
