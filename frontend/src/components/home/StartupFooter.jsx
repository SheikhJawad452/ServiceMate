import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function StartupFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <img src={logo} alt="ServiceMate" className="h-10 w-auto object-contain" />
          <p className="mt-3 text-sm text-slate-500">Trusted home services at your doorstep</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-[#1E3A8A]" href="#">About Us</a></li>
            <li><a className="hover:text-[#1E3A8A]" href="#">Careers</a></li>
            <li><a className="hover:text-[#1E3A8A]" href="#">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Services</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link className="hover:text-[#1E3A8A]" to="/technicians?service=AC%20Repair">AC Repair</Link></li>
            <li><Link className="hover:text-[#1E3A8A]" to="/technicians?service=Plumbing">Plumbing</Link></li>
            <li><Link className="hover:text-[#1E3A8A]" to="/technicians?service=Electrical">Electrical</Link></li>
            <li><Link className="hover:text-[#1E3A8A]" to="/technicians?service=Appliance%20Repair">Appliance Repair</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-[#1E3A8A]" href="#">Help Center</a></li>
            <li><a className="hover:text-[#1E3A8A]" href="#">Terms of Service</a></li>
            <li><a className="hover:text-[#1E3A8A]" href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Social</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-[#1E3A8A]" href="#">Instagram</a></li>
            <li><a className="hover:text-[#1E3A8A]" href="#">LinkedIn</a></li>
            <li><a className="hover:text-[#1E3A8A]" href="#">Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ServiceMate. All rights reserved.
      </div>
    </footer>
  );
}
