import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Spinner from "./Spinner";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useAuth();

  // Keep the loader up until auth has resolved, so Navbar/Sidebar never
  // flash a logged-out state before the user's data is ready.
  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="animate-fade-in flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
