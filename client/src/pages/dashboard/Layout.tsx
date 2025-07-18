import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ChevronRight, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());

  // Reset image cache when user data changes
  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  // Function to get the correct image URL with cache busting
  const getImageUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) {
    // Return default image from your server's public folder
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/api/images/default.png?t=${imageKey}`;
  }

  // If it's a Cloudinary URL (starts with https://res.cloudinary.com), return it directly
  if (profilePicture.startsWith("https://res.cloudinary.com")) {
    return profilePicture;
  }

  // If it's any other full URL, return it with cache buster
  if (profilePicture.startsWith("http")) {
    return `${profilePicture}?t=${imageKey}`;
  }

  // For backward compatibility with old local files (if any exist)
  const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
  return `${baseUrl}${profilePicture}?t=${imageKey}`;
};
  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Only add Dashboard if we're not already on the home page
    if (location.pathname !== "/dashboard/home") {
      breadcrumbs.push({ label: "Dashboard", path: "/dashboard/home" });
    }

    // Add subsequent segments
    let currentPath = "";
    pathSegments.slice(1).forEach((segment) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const fullPath = `/dashboard${currentPath}`;

      // Only add if it's not already the dashboard home path
      if (fullPath !== "/dashboard/home") {
        breadcrumbs.push({
          label: label.replace("-", " "),
          path: fullPath,
        });
      } else if (location.pathname === "/dashboard/home") {
        breadcrumbs.push({
          label: "Home",
          path: "/dashboard/home",
        });
      }
    });

    // If we're on dashboard home and no breadcrumbs were added, add Home
    if (breadcrumbs.length === 0 && location.pathname === "/dashboard/home") {
      breadcrumbs.push({ label: "Home", path: "/dashboard/home" });
    }

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
          <div className="flex items-center justify-between py-4">
            {/* Left Section: Sidebar Trigger + Breadcrumbs */}
            <div className="flex items-center gap-1">
              <SidebarTrigger className="inline-flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 h-9 w-9 transition-colors duration-150" />

              {/* Navigable Breadcrumbs */}
              <nav className="flex items-center text-sm text-slate-600">
                {breadcrumbs.map((crumb, index) => {
                  const isCurrentPage = index === breadcrumbs.length - 1;
                  const isClickable = !isCurrentPage;

                  return (
                    <div
                      key={`${crumb.path}-${index}`}
                      className="flex items-center"
                    >
                      {index > 0 && (
                        <ChevronRight
                          size={14}
                          className="md:mx-1 text-slate-400"
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
                <div className="flex items-center gap-2 md:bg-slate-100 text-slate-500 px-3 py-1.5 rounded-md mr-2">
                  <div className="w-8 h-8 md:w-4 md:h-4 flex items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger>
                        {user?.profilePicture ? (
                          <div className="relative flex-shrink-0">
                            <img
                              key={imageKey}
                              src={getImageUrl(user?.profilePicture)}
                              className="w-8 h-8 md:w-4 md:h-4 rounded-full object-cover ring-1 ring-slate-300"
                              alt="Profile picture"
                              crossOrigin="use-credentials"
                              onError={(e) => {
                                const baseUrl =
                                  import.meta.env.VITE_API_URL.replace(
                                    "/api/",
                                    ""
                                  );
                                (
                                  e.target as HTMLImageElement
                                ).src = `${baseUrl}/api/images/default.png?t=${Date.now()}`;
                              }}
                            />
                          </div>
                        ) : (
                          <User size={16} />
                        )}
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        sideOffset={0}
                        className="md:hidden bg-slate-200 rounded-lg px-3 py-2"
                      >
                        <span className="text-xs font-medium text-slate-500">
                          {user?.matricNumber || user?.name}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm  text-slate-500 ">
                      {user?.matricNumber || user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="bg-gray-100 flex-1 p-2">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
