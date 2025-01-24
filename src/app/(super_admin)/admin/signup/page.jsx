"use client";
import Link from "next/link";
import SignupForm from "@/components/forms/signupForm";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="font-semibold text-xl">
          <Image src="/logo.png" width={60} height={60} alt="Logo" />
        </Link>
        <Link
          href="/about"
          className="text-muted-foreground hover:text-foreground"
        >
          About us
        </Link>
      </header>
      <Separator />
      <main className="flex flex-1">dashboard
        <div className="hidden md:block w-1/2 bg-[#f3e8f7] relative">
          <Image
            src="/auth_sidebar.png"
            fill
            alt="Authentication sidebar"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex-1 flex flex-col">
          <SignupForm loginRoute={"/admin/login"} role={"SUPER_ADMIN"} />
          <footer className="text-center p-4 text-sm text-muted-foreground mt-auto">
            © LOGO {new Date().getFullYear()} All Rights Reserved.
          </footer>
        </div>
      </main>
    </div>
  );
}
