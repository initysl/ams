import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import React from "react";

const Layout: React.FC = () => {
  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <main className="flex-grow p-2">
        <SidebarTrigger className="fixed top-8 bg-emerald-500 shadow-3xl text-white z-50" />
        <div className="p-2 mt-12">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
