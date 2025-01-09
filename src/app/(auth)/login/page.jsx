'use client'
import Link from "next/link";
import LoginForm from "../../../components/forms/loginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="font-semibold text-xl">
          LOGO
        </Link>
        <Link
          href="/about"
          className="text-muted-foreground hover:text-foreground"
        >
          About us
        </Link>
      </header>
      <main className="flex min-h-[calc(100vh-8rem)]">
        <div className="hidden md:flex w-1/2 bg-[#f3e8f7] items-center justify-center p-8">
          <div className="relative w-full max-w-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-lg shadow-sm p-4">
              <div className="w-full h-full bg-purple-100 rounded flex items-center justify-center">
                <div
                  className="w-16 h-16 bg-purple-500"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 80%)" }}
                />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full shadow-sm p-4">
              <div className="w-full h-full bg-purple-100 rounded-full" />
            </div>
          </div>
        </div>
        <LoginForm />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © LOGO {new Date().getFullYear()} All Rights Reserved.
      </footer>
    </div>
  );
}
