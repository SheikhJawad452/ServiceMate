import { useAuth } from "@/context/AuthContext";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import TechnicianWorkspacePage from "@/pages/TechnicianWorkspacePage";
import UserDashboardPage from "@/pages/UserDashboardPage";

export default function DashboardRedirectPage() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminDashboardPage />;
  }

  if (user?.role === "technician") {
    return <TechnicianWorkspacePage />;
  }

  return <UserDashboardPage />;
}
