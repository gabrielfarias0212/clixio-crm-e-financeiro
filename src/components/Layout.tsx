// src/components/Layout.tsx
// Melhoria #2: FollowUpBanner adicionado logo abaixo da Navbar,
// aparece em todas as páginas sem alterar nada no layout existente.

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { FollowUpBanner } from "@/components/crm/FollowUpBanner";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:pl-14">
      <Navbar />
      <FollowUpBanner />
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
