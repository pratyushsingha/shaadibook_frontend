"use client";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import useAuth from "@/store/useAuth";
import Loader from "@/components/loader/Loader";
import { DashboardSidebar } from "@/components/Sidebar";
import { LayoutDashboard, LogOut } from "lucide-react";

const sidebarItems = [
  {
    href: "/admin/dashboard/",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    isActive: true,
  },
  {
    href: "/admin/dashboard/plans/",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Plans",
  },
  {
    href: "/logout",
    icon: <LogOut className="h-4 w-4" />,
    label: "Sign Out",
  },
];

export default function RootLayout({ children }) {
  const { user, initializeAuth, loading } = useAuth();
  useEffect(() => {
    initializeAuth();
  }, []);
  if (loading) return <Loader />;
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <DashboardSidebar user={user} sidebarItems={sidebarItems} />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between bg-gradient-to-r from-[#7B2991] to-[#4F2D82]  px-6 py-1 md:py-4 text-white rounded md:rounded-l-2xl">
            <div className="space-x-3 flex">
              <SidebarTrigger />
              <h1 className="md:text-2xl font-extrabold self-center">Home</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="self-center">{user?.name}</span>
              <Avatar>
                <AvatarImage src={user?.logo} alt={user?.name} />
                <AvatarFallback>{user?.logo}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          {children}
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}
