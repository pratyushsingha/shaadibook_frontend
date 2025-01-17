"use client";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "../../components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import useAuth from "../../store/useAuth";
import Loader from "@/components/loader/Loader";

export default function RootLayout({ children }) {
  const { user, initializeAuth, loading } = useAuth();
  useEffect(() => {
    initializeAuth();
  }, []);
  if (loading) return <Loader />;
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <DashboardSidebar user={user} />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between bg-gradient-to-r from-[#7B2991] to-[#4F2D82]  px-6 py-4 text-white rounded rounded-l-2xl">
            <div className="space-x-3 flex">
              <SidebarTrigger />
              <h1 className="text-2xl font-extrabold">
                Creating Memories For a Lifetime
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span>{user?.name}</span>
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
