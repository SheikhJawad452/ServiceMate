import { motion } from "framer-motion";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getTechnicianCity,
  getTechnicianName,
  getTechnicianRating,
  getTechnicianService,
  sortTechniciansByRating,
} from "@/utils/technicianUtils";

export default function TopTechnicians({ technicians }) {
  const topTechnicians = sortTechniciansByRating(technicians).slice(0, 6);

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#1E3A8A]">Top Technicians</h2>
          <Link to="/technicians" className="inline-flex items-center text-sm font-semibold text-[#F97316]">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topTechnicians.map((tech, index) => {
            const name = getTechnicianName(tech);
            const serviceName = getTechnicianService(tech);
            const rating = getTechnicianRating(tech);
            const city = getTechnicianCity(tech);
            const avatar = tech?.user?.avatarUrl || "";
            return (
              <motion.article
                key={tech._id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  {avatar ? (
                    <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-lg font-bold text-[#1E3A8A]">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
                    <p className="text-sm text-slate-500">{serviceName}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-amber-500" /> {rating.toFixed(1)}
                  </p>
                  <p className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 ml-2 text-slate-400" /> {city}
                  </p>
                </div>
                <Button asChild variant="outline" className="mt-5 w-full rounded-xl border-[#1E3A8A] text-[#1E3A8A] transition-all duration-200 hover:scale-[1.02] hover:bg-[#1E3A8A] hover:text-white">
                  <Link to={`/technician/${tech._id}`}>View Profile</Link>
                </Button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
