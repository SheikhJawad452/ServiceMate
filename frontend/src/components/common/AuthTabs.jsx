import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AuthTabs({ active = "login" }) {
  return (
    <div className="mb-5 flex items-center justify-center text-sm text-slate-500">
      {active === "login" ? "Don't have an account?" : "Already have an account?"}
      <Link className="relative ml-2 font-semibold text-[#1E3A8A]" to={active === "login" ? "/signup" : "/login"}>
        {active === "login" ? "Sign Up" : "Login"}
        <motion.span
          className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-[#F97316]"
          initial={{ scaleX: 0.4, opacity: 0.65 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </Link>
    </div>
  );
}
