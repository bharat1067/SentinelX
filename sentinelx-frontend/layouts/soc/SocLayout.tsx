import React from "react";
import { SharedTopNavbar } from "@/components/common/SharedTopNavbar";
import { SharedSidebar } from "@/components/common/SharedSidebar";
import { RightActivityPanel } from "@/components/common/RightActivityPanel";

interface SocLayoutProps {
  children: React.ReactNode;
}

export const SocLayout: React.FC<SocLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      <SharedTopNavbar />
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <SharedSidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#07090f]">
          {children}
        </main>
        <RightActivityPanel />
      </div>
    </div>
  );
};
