import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import React from "react";

const Layout: React.FC = () => {
  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <main className="flex-grow p-2">
        <SidebarTrigger className="fixed bg-white shadow-3xl text-green-500" />
        <div className="p-2 mt-10">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
