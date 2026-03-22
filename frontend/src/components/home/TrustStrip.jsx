import { CheckCircle2, Clock3, ShieldCheck, Star } from "lucide-react";
import { getTechnicianRating } from "@/utils/technicianUtils";

export default function TrustStrip({ technicians }) {
  const totalTechnicians = technicians.length;
  const totalServicesCompleted = technicians.reduce((sum, item) => sum + Number(item?.completedJobs || 0), 0);
  const avgRating = Number(
    (technicians.reduce((sum, item) => sum + getTechnicianRating(item), 0) / Math.max(totalTechnicians, 1)).toFixed(1),
  );

  const metrics = [
    { icon: CheckCircle2, text: `${Math.max(totalTechnicians, 1)}+ Verified Technicians` },
    { icon: Star, text: `${avgRating} Avg Rating` },
    { icon: Clock3, text: "Quick Booking" },
    { icon: ShieldCheck, text: `${Math.max(totalServicesCompleted, 1)}+ Services Completed` },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-center text-lg font-semibold text-slate-900">Trusted by customers across India</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.text} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <metric.icon className="h-4 w-4 text-[#F97316]" />
                <span>{metric.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
