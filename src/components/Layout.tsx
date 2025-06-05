
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={cn("flex-1 pb-12", className)}>
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
