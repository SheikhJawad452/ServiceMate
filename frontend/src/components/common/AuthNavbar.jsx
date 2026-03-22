import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function AuthNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 text-lg font-bold text-primary transition hover:text-accent" to="/">
          <img className="h-8 w-auto" src={logo} alt="ServiceMate logo" />

        </Link>
        <Link className="text-sm font-medium text-slate-600 transition hover:text-primary" to="/">
          Home
        </Link>
      </nav>
    </header>
  );
}
