import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { ChevronRight, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Start with Dashboard
    breadcrumbs.push({ label: "Dashboard", path: "/dashboard/home" });

    // Add subsequent segments
    let currentPath = "";
    pathSegments.slice(1).forEach((segment) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label: label.replace("-", " "),
        path: `/dashboard${currentPath}`,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentDateTime = new Date().toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleBreadcrumbClick = (path: string, isCurrentPage: boolean) => {
    if (!isCurrentPage) {
      navigate(path);
    }
  };

  return (
    <SidebarProvider className="min-h-screen bg-slate-50">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200 backdrop-blur-sm bg-white/95">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Left Section: Sidebar Trigger + Breadcrumbs */}
            <div className="flex items-center gap-4">
              <SidebarTrigger className="inline-flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 h-9 w-9 transition-colors duration-150" />

              {/* Navigable Breadcrumbs */}
              <nav className="flex items-center space-x-1 text-sm text-slate-600">
                {breadcrumbs.map((crumb, index) => {
                  const isCurrentPage = index === breadcrumbs.length - 1;
                  const isClickable = !isCurrentPage;

                  return (
                    <div key={crumb.path} className="flex items-center">
                      {index > 0 && (
                        <ChevronRight
                          size={14}
                          className="mx-1 text-slate-400"
                        />
                      )}
                      <span
                        onClick={() =>
                          handleBreadcrumbClick(crumb.path, isCurrentPage)
                        }
                        className={`transition-colors duration-150 ${
                          isCurrentPage
                            ? "text-slate-900 font-medium cursor-default"
                            : "text-slate-500 hover:text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md"
                        }`}
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (
                            isClickable &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            handleBreadcrumbClick(crumb.path, isCurrentPage);
                          }
                        }}
                      >
                        {crumb.label}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Right Section: Time and User Info */}
            <div className="flex items-center gap-3">
              {/* Time Display */}
              <div className="hidden md:flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
                {currentDateTime}
              </div>

              {/* User Info */}
              <div>
                <div className="flex items-center gap-2 text-slate-600 px-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-slate-900">
                      {user?.email}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {user?.matricNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 px-6 py-3">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
