import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import React from "react";

const Layout: React.FC = () => {
  return (
    <SidebarProvider className="p-2 flex">
      <AppSidebar />
      <main className="flex-grow p-4">
        <SidebarTrigger className="bg-white shadow-3xl" />
        <div className="flex justify-center items-center">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
