import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function TechnicianDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-2xl font-bold text-primary">{user?.fullName || "Technician"} Dashboard</h1>
            </div>
            <Button variant="accent" onClick={() => logout(navigate)}>
              Logout
            </Button>
          </div>
          <p className="mt-2 text-sm text-slate-600">Manage your work from dedicated sections.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="h-12 justify-start">
              <Link to="/technician/bookings">View Bookings</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 justify-start">
              <Link to="/technician/services">Manage Services</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 justify-start">
              <Link to="/technician/portfolio">Portfolio</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
