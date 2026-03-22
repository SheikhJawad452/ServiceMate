import { motion } from "framer-motion";
import { Briefcase, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

const sortOptions = [
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "experience_desc", label: "Experience: High to Low" },
];
const predefinedServices = [
  "Plumbing",
  "AC Repair",
  "Electrician",
  "Cleaning",
  "Washing Machine Repair",
  "Fridge Repair",
];
const loadingSkeletons = [1, 2, 3, 4];

export default function TechnicianListingPage() {
  const [filters, setFilters] = useState({
    city: "",
    service: "",
  });
  const [sortBy, setSortBy] = useState("rating_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [serviceCatalog, setServiceCatalog] = useState(predefinedServices);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get("/services");
        const serviceNames = (response?.data || [])
          .map((item) => item?.serviceName?.trim())
          .filter(Boolean);
        setServiceCatalog(Array.from(new Set([...predefinedServices, ...serviceNames])));
      } catch {
        setServiceCatalog(predefinedServices);
      }
    };

    loadServices();
  }, []);

  const sortedTechnicians = useMemo(() => {
    const list = [...technicians];
    if (sortBy === "experience_desc") {
      return list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    }
    return list.sort((a, b) => (b.avgRating || b.averageRating || 0) - (a.avgRating || a.averageRating || 0));
  }, [sortBy, technicians]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTechnicians = async (searchFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchFilters.city.trim()) params.city = searchFilters.city.trim();
      if (searchFilters.service.trim()) params.service = searchFilters.service.trim();
      const response = await api.get("/technicians", { params });
      const results = response?.data || [];
      setTechnicians(results);
    } catch (apiError) {
      const errorMessage = apiError?.message || "Failed to load technicians.";
      setError(errorMessage);
      setTechnicians([]);
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    fetchTechnicians(filters);
  };

  const filteredServiceSuggestions = useMemo(() => {
    const query = filters.service.trim().toLowerCase();
    if (!query) return serviceCatalog;
    return serviceCatalog.filter((item) => item.toLowerCase().includes(query));
  }, [filters.service, serviceCatalog]);

  useEffect(() => {
    fetchTechnicians({ city: "", service: "" });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-4 py-10 text-slate-900 sm:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Find Technicians</h1>
          <p className="mt-2 text-sm text-slate-600">Search by city and service, then sort results.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            Filters & Sorting
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <MapPin className="h-4 w-4 text-primary" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="City"
                value={filters.city}
                onChange={(event) => handleFilterChange("city", event.target.value)}
              />
            </div>
            <div className="relative flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-primary" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Service"
                value={filters.service}
                onChange={(event) => {
                  handleFilterChange("service", event.target.value);
                  setShowServiceSuggestions(true);
                }}
                onFocus={() => setShowServiceSuggestions(true)}
                onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 120)}
              />
              {showServiceSuggestions && filteredServiceSuggestions.length > 0 ? (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {filteredServiceSuggestions.map((serviceName) => (
                    <button
                      key={serviceName}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                      onClick={() => {
                        handleFilterChange("service", serviceName);
                        setShowServiceSuggestions(false);
                      }}
                    >
                      {serviceName}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Button type="button" variant="accent" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="mt-6">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!loading && !error && hasLoaded && sortedTechnicians.length === 0 ? (
            <p className="text-sm text-slate-500">No technicians found for your search</p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading
              ? loadingSkeletons.map((item) => (
                  <div
                    key={`skeleton-${item}`}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
                    <div className="mt-5 h-4 w-48 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-56 rounded bg-slate-200" />
                    <div className="mt-6 flex gap-2">
                      <div className="h-8 w-24 rounded bg-slate-200" />
                      <div className="h-8 w-24 rounded bg-slate-200" />
                    </div>
                  </div>
                ))
              : null}
            {sortedTechnicians.map((technician, index) => {
              const rating = technician.avgRating || technician.averageRating || 0;
              const profileName = technician?.user?.fullName || "Technician";
              const city = technician?.location?.city || "-";
              const serviceNames = Array.isArray(technician.services)
                ? technician.services.map((item) => item.serviceName).filter(Boolean)
                : [];

              return (
                <motion.article
                  key={technician._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{profileName}</h3>
                      <p className="mt-1 text-sm text-slate-600">{city}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
                      <Star className="h-3.5 w-3.5 fill-current" /> {Number(rating).toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="inline-flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      {technician.experienceYears || 0} years experience
                    </p>
                    <p className="line-clamp-2">
                      <span className="font-medium text-slate-700">Services: </span>
                      {serviceNames.length > 0 ? serviceNames.join(", ") : "No services listed"}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/technician/${technician._id}`}>View Profile</Link>
                    </Button>
                    <Button asChild size="sm" variant="accent">
                      <Link to={`/technician/${technician._id}`}>Book</Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
