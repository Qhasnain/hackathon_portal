import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

interface LayoutProps {
  showSidebar?: boolean;
}

export default function Layout({ showSidebar = false }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {showSidebar && <Sidebar />}
        <main className="flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
