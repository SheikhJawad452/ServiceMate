import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
}
