
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  const location = useLocation();
  
  // Don't show navbar on landing and auth pages
  const hideNavbar = location.pathname === "/landing" || location.pathname === "/auth";

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className={cn("flex-1 pb-12", className, hideNavbar && "pt-0")}>
        {children}
      </main>
      <footer className="py-4 border-t text-center text-sm text-gray-500">
        <div className="max-w-screen-2xl mx-auto px-4">
          © {new Date().getFullYear()} GCLIXIO
        </div>
      </footer>
    </div>
  );
}
