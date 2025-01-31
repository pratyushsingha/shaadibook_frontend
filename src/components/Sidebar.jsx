"use client";

import Link from "next/link";
import { CreditCard, LayoutDashboard, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function DashboardSidebar({ user, sidebarItems }) {
  const pathname = usePathname();
  return (
    <Sidebar className="border-r ">
      <SidebarHeader className="border-b p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image width={50} height={50} src="/logo.png" alt="sidebar logo" />
          <h3 className="text-purple-900 font-bold text-xl">SHAADI ALBUM</h3>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8">
            <Avatar>
              <AvatarImage src={user?.logo} alt={user?.name} />
              <AvatarFallback>{user?.name}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>
          <SidebarMenu>
            {sidebarItems.map(({ href, icon, label }) => {
              const isActive = pathname === href;
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={href}
                      className={`${
                        isActive
                          ? "bg-purple-700 text-white hover:bg-purple-800 hover:text-white"
                          : ""
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
