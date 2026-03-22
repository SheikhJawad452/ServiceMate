import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, Clock3, FolderKanban, Star, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const statusClassMap = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  rejected: "bg-slate-200 text-slate-700",
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function TechnicianWorkspacePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setError("");
    setLoading(true);
    try {
      const [bookingsRes, servicesRes, profileRes] = await Promise.all([
        api.get("/bookings/technician"),
        api.get("/services/mine"),
        api.get("/technicians/me/profile"),
      ]);
      setBookings(bookingsRes?.data || []);
      setServices(servicesRes?.data || []);
      setTechnicianProfile(profileRes?.data || null);
    } catch (apiError) {
      setError(apiError?.message || "Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const normalizeStatus = (status) => String(status || "").toLowerCase();

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((item) => normalizeStatus(item.status) === "pending").length;
    const completedJobs = bookings.filter((item) => normalizeStatus(item.status) === "completed").length;
    const ratingValue = Number(technicianProfile?.avgRating ?? technicianProfile?.averageRating ?? 0);

    return {
      totalBookings,
      pendingBookings,
      completedJobs,
      rating: Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : "0.0",
    };
  }, [bookings, technicianProfile]);

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.createdAt || b.scheduledDate || 0).getTime() - new Date(a.createdAt || a.scheduledDate || 0).getTime())
        .slice(0, 5),
    [bookings],
  );

  const topServices = useMemo(() => services.slice(0, 3), [services]);
  const latestPortfolio = useMemo(() => (technicianProfile?.portfolio || []).slice(0, 3), [technicianProfile]);
  const initials = (user?.fullName || "T")
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Workspace</p>
              <h1 className="text-3xl font-bold text-primary sm:text-4xl">Welcome back, {user?.fullName || "Technician"}</h1>
              <p className="mt-2 text-slate-600">Manage bookings, services and grow your business</p>
              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-md">
                {initials}
              </div>
              <Button variant="accent" onClick={() => logout(navigate)}>
                Logout
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.05, duration: 0.35 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Total Bookings", value: stats.totalBookings, icon: Briefcase },
            { label: "Pending Bookings", value: stats.pendingBookings, icon: Clock3 },
            { label: "Completed Jobs", value: stats.completedJobs, icon: CheckCircle2 },
            { label: "Rating", value: stats.rating, icon: Star },
          ].map((item) => (
            <motion.article
              key={item.label}
              whileHover={{ y: -4, scale: 1.01 }}
              className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition hover:shadow-xl"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex-1">
                  <item.icon className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm text-slate-500">{item.label}</p>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1, duration: 0.35 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {[
            {
              title: "View Bookings",
              description: "Track requests, update status and finish jobs with final bills.",
              icon: Clock3,
              to: "/technician/bookings",
            },
            {
              title: "Manage Services",
              description: "Add or update services and pricing to attract more customers.",
              icon: Wrench,
              to: "/technician/services",
            },
            {
              title: "Portfolio",
              description: "Show your best projects and build trust quickly.",
              icon: FolderKanban,
              to: "/technician/portfolio",
            },
          ].map((card) => (
            <motion.div key={card.title} whileHover={{ y: -4, scale: 1.01 }} className="h-full">
              <Link
                to={card.to}
                className="block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex-1">
                    <card.icon className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{card.description}</p>
                  </div>
                  <div className="mt-4 text-sm font-medium text-primary">Open →</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary">Recent Bookings</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/technician/bookings">View All</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {loading ? (
              [1, 2, 3].map((id) => (
                <div key={id} className="animate-pulse rounded-xl border border-slate-200 p-4">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
                </div>
              ))
            ) : bookings.length > 0 ? (
              recentBookings.map((booking) => {
                const status = normalizeStatus(booking.status);
                const statusClass = statusClassMap[status] || "bg-slate-100 text-slate-700";
                return (
                  <motion.article
                    key={booking._id}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-slate-200 p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">{booking?.user?.fullName || "Customer"}</p>
                        <p className="text-sm text-slate-600">{booking?.service?.serviceName || "Service"}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(booking.scheduledDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-accent">₹{booking?.totalPrice ?? 0}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>{status}</span>
                    </div>
                  </motion.article>
                );
              })
            ) : (
              services.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">No services yet</p>
                  <p className="mt-1">Start by adding your first service.</p>
                  <Button asChild variant="accent" size="sm" className="mt-3">
                    <Link to="/technician/services">Add Service</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">No bookings yet</p>
                  <p className="mt-1">Your services are live. Customers will book soon.</p>
                </div>
              )
            )}
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.35 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">Services Preview</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/technician/services">Manage</Link>
              </Button>
            </div>
            <div className="mt-4 flex-1 space-y-3">
              {topServices.length > 0 ? (
                topServices.map((service) => (
                  <div key={service._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-slate-800">{service.serviceName}</p>
                      <p className="text-sm text-slate-500">{service.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-accent">₹{service.price ?? 0}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/technician/services">Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">No services yet</p>
                  <p className="mt-1">Start by adding your first service.</p>
                  <Button asChild variant="accent" size="sm" className="mt-3">
                    <Link to="/technician/services">Add Service</Link>
                  </Button>
                </div>
              )}
            </div>
            </div>
          </article>

          <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">Portfolio Preview</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/technician/portfolio">Manage</Link>
              </Button>
            </div>
            <div className="mt-4 flex-1 grid gap-3 sm:grid-cols-2">
              {latestPortfolio.length > 0 ? (
                latestPortfolio.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="overflow-hidden rounded-xl border border-slate-200">
                    {item.imageUrl ? (
                      <img alt={item.title || "Portfolio"} className="h-24 w-full object-cover" src={item.imageUrl} />
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-slate-100 text-xs text-slate-500">No image</div>
                    )}
                    <div className="p-3">
                      <p className="line-clamp-1 font-medium text-slate-800">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description || "No details provided"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600 sm:col-span-2">
                  <p className="font-medium text-slate-700">No portfolio items yet</p>
                  <p className="mt-1">Upload project photos to improve trust and conversion.</p>
                  <Button asChild variant="accent" size="sm" className="mt-3">
                    <Link to="/technician/portfolio">Upload Portfolio</Link>
                  </Button>
                </div>
              )}
            </div>
            </div>
          </article>
        </motion.section>
      </div>
    </main>
  );
}
