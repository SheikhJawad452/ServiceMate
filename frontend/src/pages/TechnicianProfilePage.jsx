import { motion } from "framer-motion";
import { Briefcase, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function TechnicianProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchTechnician = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/technicians/${id}`, { signal: controller.signal });
        setTechnician(response?.data || null);
      } catch (apiError) {
        if (apiError.name !== "CanceledError") {
          setError(apiError?.message || "Failed to load technician profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTechnician();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 text-sm text-slate-600">Loading profile...</main>;
  }

  if (error || !technician) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
        <p className="text-sm text-red-600">{error || "Technician not found."}</p>
      </main>
    );
  }

  const rating = technician.avgRating || technician.averageRating || 0;
  const name = technician?.user?.fullName || "Technician";
  const location = [technician?.location?.city, technician?.location?.state, technician?.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-4 py-10 text-slate-900 sm:px-6">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.3fr_1fr]">
        <motion.article
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">{name}</h1>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-accent" />
                {location || "Location not provided"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
              <Star className="h-3.5 w-3.5 fill-current" /> {Number(rating).toFixed(1)}
            </span>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Experience</h2>
            <p className="mt-2 inline-flex items-center gap-2 text-slate-700">
              <Briefcase className="h-4 w-4 text-primary" />
              {technician.experienceYears || 0} years
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Services</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(technician.services || []).map((service) => (
                <div key={service._id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">{service.serviceName}</p>
                  <p className="mt-1 text-sm text-slate-600">{service.description || "No description"}</p>
                  <p className="mt-2 text-sm font-semibold text-accent">${service.price ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.article>

        <motion.aside
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <h2 className="text-lg font-semibold text-primary">Portfolio</h2>
          <div className="mt-4 grid gap-3">
            {Array.isArray(technician.portfolio) && technician.portfolio.length > 0 ? (
              technician.portfolio.map((item, index) => (
                <div key={`${item.title || "portfolio"}-${index}`} className="overflow-hidden rounded-xl border border-slate-200">
                  {item.imageUrl ? (
                    <img alt={item.title || "Portfolio"} className="h-36 w-full object-cover" src={item.imageUrl} />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-slate-100 text-xs text-slate-500">
                      Portfolio image
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-medium text-slate-800">{item.title || "Project"}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description || "No details provided"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No portfolio added yet.</p>
            )}
          </div>

          <Button asChild className="mt-6 w-full" variant="accent">
            <Link to={`/bookings/new?technicianId=${technician._id}`}>Book Now</Link>
          </Button>
        </motion.aside>
      </section>
    </main>
  );
}
