import {
  ListCheck,
  Home,
  ScanQrCode,
  Settings,
  QrCodeIcon,
  User2,
  ChevronUp,
  SeparatorVerticalIcon,
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
  const location = useLocation();
  const isActive = (item: { url: string }) =>
    location.pathname.includes(`/dashboard/${item.url}`);

  return (
    <Sidebar className="bg-stone-400 border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-3xl font-bold py-8 mb-5 text-center text-white tracking-widest">
            AttendEase
          </SidebarGroupLabel>
          <Separator className="bg-white mb-5" />
          <SidebarGroupContent>
            <SidebarMenu className=" space-y-5">
              {items.map((item) => {
                const active = isActive(item);

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={`p-2 transition-colors duration-200 ${
                      active
                        ? "  rounded-xl shadow-2xs bg-white"
                        : "  transition-all duration-200 rounded-xl "
                    }`}
                  >
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={`/dashboard/${item.url}`}>
                        <item.icon fontSize={20} />
                        <span className="">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarFooter className="fixed bottom-2 left-0 bg-white rounded-xl">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <User2 />
                      lawalyusuf356@gmail.com
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
