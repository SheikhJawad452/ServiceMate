import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardPath =
    user?.role === "technician"
      ? "/technician"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";

  const onLogout = () => {
    logout(navigate);
  };
  const isActive = (path) => location.pathname === path;
  const navButtonClass = (path) =>
    isActive(path) ? "border-primary bg-primary/10 text-primary hover:bg-primary/15" : "";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2" to="/">
          <img className="h-8 w-auto" src={logo} alt="ServiceMate logo" />
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {user?.role !== "technician" ? (
              <Button asChild variant="outline" size="sm" className={navButtonClass("/")}>
                <Link to="/">Home</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm" className={navButtonClass(dashboardPath)}>
              <Link to={dashboardPath}>{user?.role === "technician" ? "Workspace" : "Dashboard"}</Link>
            </Button>
            {user?.role === "user" ? (
              <Button asChild variant="outline" size="sm" className={navButtonClass("/technicians")}>
                <Link to="/technicians">Browse Services</Link>
              </Button>
            ) : null}
            {user?.role === "user" ? (
              <Button asChild variant="outline" size="sm" className={navButtonClass("/bookings")}>
                <Link to="/bookings">My Bookings</Link>
              </Button>
            ) : null}
            {user?.role === "technician" ? (
              <>
                <Button asChild variant="outline" size="sm" className={navButtonClass("/technician/bookings")}>
                  <Link to="/technician/bookings">Bookings</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className={navButtonClass("/technician/services")}>
                  <Link to="/technician/services">Services</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className={navButtonClass("/technician/portfolio")}>
                  <Link to="/technician/portfolio">Portfolio</Link>
                </Button>
              </>
            ) : null}
            <Button asChild variant="outline" size="sm" className={navButtonClass("/profile")}>
              <Link to="/profile">Profile</Link>
            </Button>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {(user?.fullName || "U").trim().charAt(0).toUpperCase()}
              </div>
              <span className="max-w-24 truncate text-sm text-slate-700">{user?.fullName || "User"}</span>
            </div>
            <Button variant="accent" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
