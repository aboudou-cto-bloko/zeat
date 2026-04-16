import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardBottomNav } from "@/components/dashboard-bottom-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-pure-white">
      {/* Sidebar — desktop only */}
      <DashboardSidebar />
      {/* Main content — adds bottom padding on mobile for the bottom nav */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </main>
      {/* Bottom nav — mobile only */}
      <DashboardBottomNav />
    </div>
  );
}
