import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import realAcTech from "@/assets/realImages/realAcTech.png";
import realElecTech from "@/assets/realImages/realElecTech.png";
import realPlumTech from "@/assets/realImages/realPlumTech.png";
import realWashTech from "@/assets/realImages/realWashTech.png";

const heroImages = [realAcTech, realElecTech, realPlumTech, realWashTech];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          <span className="inline-flex items-center rounded-full bg-[#1E3A8A]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#1E3A8A]">
            Premium Home Services
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-[#1E3A8A] sm:text-5xl">
            Book Trusted Home Services in Minutes
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">Verified professionals for AC, Plumbing, Electrical & more</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#EA580C]">
              <Link to="/technicians">
                <Search className="mr-2 h-4 w-4" />
                Search Technicians
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-[#1E3A8A] px-6 py-3 font-semibold text-[#1E3A8A] transition-all duration-200 hover:scale-[1.02] hover:bg-[#1E3A8A] hover:text-white"
            >
              <Link to="/technicians">Browse Services</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl bg-slate-50 p-3 shadow-md"
        >
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-white">
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={heroImages[index]}
                alt="Technician"
                className="h-full w-full object-contain object-center"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
